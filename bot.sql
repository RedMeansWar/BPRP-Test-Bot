USE s1_master;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS guilds (

    guild_id VARCHAR(255) PRIMARY KEY,
    guild_owner VARCHAR(255) NOT NULL,
    welcome_channel VARCHAR(255) NOT NULL,
    welcome_role VARCHAR(500) NOT NULL
);

CREATE TABLE IF NOT EXISTS banned_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patrol_reactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    message_id VARCHAR(255) NOT NULL,
    reaction_emoji VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT reaction_emoji, ROW_COUNT(reaction_emoji) AS reaction_count
FROM patrol_reactions
GROUP BY reaction_emoji
ORDER BY reaction_count DESC
LIMIT 1;