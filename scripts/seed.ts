import pg from 'pg';
import { portfolioData } from '../src/data/portfolio.ts';

const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  await client.connect();
  console.log('Beginning repeatable seeding transaction...');
  await client.query('BEGIN');

  try {
    // 1. Profiles
    console.log('Seeding profiles...');
    const { personal, codingStats, achievements, skillCategories, projects, journey } = portfolioData;

    await client.query(`
      INSERT INTO profiles (
        full_name, professional_title, headline, short_bio, about, location,
        public_email, phone, profile_image_url, hero_image_url, resume_url, is_primary
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
      ON CONFLICT DO NOTHING;
    `, [
      personal.name,
      personal.role,
      "YOUR FRIENDLY NEIGHBORHOOD ENGINEER",
      personal.bio.intro,
      `${personal.bio.skillsFocus}\n\n${personal.bio.webFocus}`,
      "Banda, Uttar Pradesh, India",
      personal.contact.email,
      personal.contact.phone,
      "/assets/spider/hero.png",
      "/assets/spider/hero.png",
      personal.contact.resumePath || "/resume.pdf"
    ]);

    // 2. Site Settings
    console.log('Seeding site_settings...');
    const defaultSettings = [
      {
        key: 'hero_config',
        value: {
          badge: 'YOUR FRIENDLY NEIGHBORHOOD ENGINEER',
          headline: 'BUILDING SCALABLE SYSTEMS & SOLVING HARD PROBLEMS',
          resumeFileName: 'Akash_Kumar_Resume.pdf'
        },
        desc: 'Hero section configuration and tagline'
      },
      {
        key: 'seo_metadata',
        value: {
          title: 'Akash Kumar | Software Developer & IT Student',
          description: 'Portfolio of Akash Kumar, a B.Tech Information Technology student focused on software development, Data Structures & Algorithms, competitive programming (1807 LeetCode rating, 548 solved), and full-stack engineering.',
          canonical: 'https://github.com/Akash-314'
        },
        desc: 'Global website SEO and Open Graph metadata'
      },
      {
        key: 'spider_sense',
        value: {
          triggerRadius: 250,
          sensitivity: 8,
          oscillationAmplitude: 2.8
        },
        desc: 'Interactive spider-sense cursor configuration'
      }
    ];

    for (const setting of defaultSettings) {
      await client.query(`
        INSERT INTO site_settings (setting_key, setting_value, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (setting_key) DO UPDATE
        SET setting_value = EXCLUDED.setting_value,
            description = EXCLUDED.description;
      `, [setting.key, JSON.stringify(setting.value), setting.desc]);
    }

    // 3. Projects and Project Technologies
    console.log('Seeding projects & technologies...');
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];
      const projectRes = await client.query(`
        INSERT INTO projects (
          slug, title, tagline, description, problem_statement, solution,
          cover_image_url, github_url, live_demo_url, featured, published, display_order
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, $11)
        ON CONFLICT (slug) DO UPDATE
        SET title = EXCLUDED.title,
            tagline = EXCLUDED.tagline,
            description = EXCLUDED.description,
            github_url = EXCLUDED.github_url,
            featured = EXCLUDED.featured,
            display_order = EXCLUDED.display_order
        RETURNING id;
      `, [
        p.id,
        p.title,
        p.subtitle,
        p.description,
        p.highlights ? p.highlights[0] || null : null,
        p.highlights ? p.highlights.slice(1).join(' • ') || null : null,
        p.imageAlt ? '/assets/spider/web.png' : null,
        p.githubUrl || null,
        p.liveUrl || null,
        Boolean(p.featured),
        i + 1
      ]);

      const projectId = projectRes.rows[0].id;

      // Seed project technologies
      for (let tIdx = 0; tIdx < p.technologies.length; tIdx++) {
        const tech = p.technologies[tIdx];
        await client.query(`
          INSERT INTO project_technologies (project_id, technology_name, display_order)
          VALUES ($1, $2, $3)
          ON CONFLICT (project_id, technology_name) DO NOTHING;
        `, [projectId, tech, tIdx + 1]);
      }
    }

    // 4. Skill Categories and Skills
    console.log('Seeding skill categories & skills...');
    for (let cIdx = 0; cIdx < skillCategories.length; cIdx++) {
      const cat = skillCategories[cIdx];
      const catSlug = cat.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const catRes = await client.query(`
        INSERT INTO skill_categories (name, slug, description, display_order)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (slug) DO UPDATE
        SET name = EXCLUDED.name,
            display_order = EXCLUDED.display_order
        RETURNING id;
      `, [cat.category, catSlug, `Skills in ${cat.category}`, cIdx + 1]);

      const categoryId = catRes.rows[0].id;

      for (let sIdx = 0; sIdx < cat.skills.length; sIdx++) {
        const s = cat.skills[sIdx];
        await client.query(`
          INSERT INTO skills (
            category_id, name, icon, proficiency_level, is_highlight, display_order
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (category_id, name) DO UPDATE
          SET proficiency_level = EXCLUDED.proficiency_level,
              is_highlight = EXCLUDED.is_highlight,
              display_order = EXCLUDED.display_order;
        `, [
          categoryId,
          s.name,
          s.icon || null,
          s.level || 'Advanced',
          Boolean(s.highlight),
          sIdx + 1
        ]);
      }
    }

    // 5. Achievements
    console.log('Seeding achievements...');
    for (let aIdx = 0; aIdx < achievements.length; aIdx++) {
      const a = achievements[aIdx];
      await client.query(`
        INSERT INTO achievements (
          title, organization, description, achievement_date, position,
          tags, connected_to, featured, published, display_order
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9)
        ON CONFLICT DO NOTHING;
      `, [
        a.title,
        `${a.organizer} (${a.event})`,
        a.description,
        a.year,
        a.position,
        a.tags || [],
        a.connectedTo || [],
        Boolean(a.featured),
        a.order || aIdx + 1
      ]);
    }

    // 6. Education & Experience (from Journey and Personal data)
    console.log('Seeding education & experiences from Journey milestones...');
    for (let jIdx = 0; jIdx < journey.length; jIdx++) {
      const item = journey[jIdx];
      if (item.type === 'education') {
        await client.query(`
          INSERT INTO education (
            institution, degree, branch, start_year, end_year, description, display_order
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT DO NOTHING;
        `, [
          item.institutionOrEvent,
          "Bachelor of Technology (B.Tech)",
          "Information Technology",
          "2023",
          "2027",
          `${item.description}\n${(item.details || []).join(' • ')}`,
          jIdx + 1
        ]);
      } else {
        // Experience / Leadership / Hackathon roles
        await client.query(`
          INSERT INTO experiences (
            organization, role, employment_type, description, location,
            start_date, end_date, currently_working, display_order, published
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, false, $8, true)
          ON CONFLICT DO NOTHING;
        `, [
          item.institutionOrEvent,
          item.title,
          "Competitive Achievement / Hackathon Project",
          `${item.description}\n${(item.details || []).join(' • ')}`,
          "India",
          item.period,
          item.period,
          jIdx + 1
        ]);
      }
    }

    // 7. Coding Profiles & Initial Coding Stats History
    console.log('Seeding coding_profiles & history...');
    const codingProfilesData = [
      {
        platform_name: 'LeetCode',
        username: codingStats.leetcodeUsername || 'Sp4rk314',
        profile_url: codingStats.leetcodeUrl,
        rating: codingStats.rating,
        rank: 'Top 8% Worldwide (Knight track)',
        total_solved: codingStats.totalSolved,
        easy_solved: codingStats.easy,
        medium_solved: codingStats.medium,
        hard_solved: codingStats.hard,
        display_order: 1
      },
      {
        platform_name: 'Codeforces',
        username: codingStats.codeforcesUsername || 'itsakash314',
        profile_url: codingStats.codeforcesUrl,
        rating: codingStats.codeforcesRating,
        rank: codingStats.codeforcesStatus,
        total_solved: 0,
        easy_solved: 0,
        medium_solved: 0,
        hard_solved: 0,
        display_order: 2
      },
      {
        platform_name: 'CodeChef',
        username: codingStats.codechefUsername || 'sp4rk314',
        profile_url: codingStats.codechefUrl,
        rating: codingStats.codechefRating,
        rank: codingStats.codechefStars,
        total_solved: 0,
        easy_solved: 0,
        medium_solved: 0,
        hard_solved: 0,
        display_order: 3
      },
      {
        platform_name: 'Codolio',
        username: 'Sp4rk',
        profile_url: codingStats.codolioUrl || 'https://codolio.com/profile/Sp4rk',
        rating: 0,
        rank: 'Multi-platform Tracker',
        total_solved: codingStats.totalSolved,
        easy_solved: codingStats.easy,
        medium_solved: codingStats.medium,
        hard_solved: codingStats.hard,
        display_order: 4
      }
    ];

    for (const cp of codingProfilesData) {
      const cpRes = await client.query(`
        INSERT INTO coding_profiles (
          platform_name, username, profile_url, rating, rank,
          total_solved, easy_solved, medium_solved, hard_solved,
          display_order, is_active, last_synced_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, NOW())
        ON CONFLICT (platform_name) DO UPDATE
        SET rating = EXCLUDED.rating,
            rank = EXCLUDED.rank,
            total_solved = EXCLUDED.total_solved,
            easy_solved = EXCLUDED.easy_solved,
            medium_solved = EXCLUDED.medium_solved,
            hard_solved = EXCLUDED.hard_solved,
            last_synced_at = NOW()
        RETURNING id;
      `, [
        cp.platform_name,
        cp.username,
        cp.profile_url,
        cp.rating,
        cp.rank,
        cp.total_solved,
        cp.easy_solved,
        cp.medium_solved,
        cp.hard_solved,
        cp.display_order
      ]);

      const profileId = cpRes.rows[0].id;

      // Add snapshot record to coding_stats_history
      await client.query(`
        INSERT INTO coding_stats_history (
          coding_profile_id, rating, total_solved, metrics
        )
        VALUES ($1, $2, $3, $4);
      `, [
        profileId,
        cp.rating,
        cp.total_solved,
        JSON.stringify({
          easy: cp.easy_solved,
          medium: cp.medium_solved,
          hard: cp.hard_solved,
          rank: cp.rank
        })
      ]);
    }

    // 8. Social Links
    console.log('Seeding social_links...');
    const socialLinksData = [
      {
        platform_name: 'GitHub',
        username: 'Akash-314',
        profile_url: personal.contact.github,
        icon: 'GithubIcon',
        display_order: 1
      },
      {
        platform_name: 'LinkedIn',
        username: 'sp4rk314',
        profile_url: personal.contact.linkedin,
        icon: 'LinkedinIcon',
        display_order: 2
      },
      {
        platform_name: 'Email',
        username: personal.contact.email,
        profile_url: `mailto:${personal.contact.email}`,
        icon: 'Mail',
        display_order: 3
      },
      {
        platform_name: 'Phone',
        username: personal.contact.phone,
        profile_url: `tel:${personal.contact.phone}`,
        icon: 'Phone',
        display_order: 4
      }
    ];

    for (const s of socialLinksData) {
      await client.query(`
        INSERT INTO social_links (platform_name, username, profile_url, icon, display_order, is_active)
        VALUES ($1, $2, $3, $4, $5, true)
        ON CONFLICT (platform_name) DO UPDATE
        SET profile_url = EXCLUDED.profile_url,
            username = EXCLUDED.username,
            icon = EXCLUDED.icon,
            display_order = EXCLUDED.display_order;
      `, [s.platform_name, s.username, s.profile_url, s.icon, s.display_order]);
    }

    // 9. Media Assets initial record for resume
    console.log('Seeding media_assets reference for resume...');
    await client.query(`
      INSERT INTO media_assets (
        file_name, original_file_name, bucket_name, object_key,
        file_type, mime_type, file_size, alt_text
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (object_key) DO NOTHING;
    `, [
      "resume.pdf",
      "Akash_Kumar_Resume.pdf",
      "assets",
      "resumes/default_resume.pdf",
      "document",
      "application/pdf",
      102400,
      "Akash Kumar Software Developer Resume"
    ]);

    await client.query('COMMIT');
    console.log('All portfolio content seeded successfully and committed!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding encountered error, transaction rolled back:', err);
    throw err;
  } finally {
    await client.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

