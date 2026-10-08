CREATE TABLE IF NOT EXISTS cmd_user_device_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  device_token VARCHAR(512) NOT NULL,
  platform ENUM('android', 'ios') NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  creation_stamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_stamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cmd_user_device_tokens_token (device_token),
  KEY idx_cmd_user_device_tokens_user_active (user_id, is_active)
);
