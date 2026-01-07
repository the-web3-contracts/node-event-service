DO
$$
   BEGIN
        IF
            NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'uint256') THEN
            CREATE DOMAIN UINT256 AS NUMERIC CHECK (VALUE >= 0 AND VALUE < POWER(CAST(2 AS NUMERIC), CAST(256 AS NUMERIC)) AND SCALE(VALUE) = 0);
        ELSE
            ALTER DOMAIN UINT256 DROP CONSTRAINT uint256_check;
            ALTER DOMAIN UINT256 ADD CHECK (VALUE >= 0 AND VALUE < POWER(CAST(2 AS NUMERIC), CAST(256 AS NUMERIC)) AND SCALE(VALUE) = 0);
        END IF;
   END
$$;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" cascade;

create table if not exists sys_log (
    guid          TEXT PRIMARY KEY DEFAULT replace(uuid_generate_v4()::text, '-', ''),
    action        VARCHAR(100) DEFAULT '', -- 路径 --
    remark        VARCHAR(100) DEFAULT '', -- 描述 --
    admin         VARCHAR(30)  DEFAULT '', -- 操作管理员 --
    ip            VARCHAR(30)  DEFAULT '', -- 操作管理员 IP --
    cate          SMALLINT DEFAULT 0,      -- 类型(0表示其他;1=>表示登陆;2=>表示财务操作) --
    status        SMALLINT DEFAULT -1,     -- 登陆状态(0=>成功;1=>失败) --
    asset         VARCHAR(255) DEFAULT '', -- 币种 --
    before        VARCHAR(255) DEFAULT '', -- 修改前 --
    after         VARCHAR(255) DEFAULT '', -- 修改后 --
    user_guid     VARCHAR(255) DEFAULT '', -- 用户ID --
    order_number  VARCHAR(64) DEFAULT '',
    op            SMALLINT DEFAULT -1,     -- 操作类型(0添加;1编辑)
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_syslog_cate ON sys_log (cate);
CREATE INDEX idx_syslog_status ON sys_log (status);
CREATE INDEX idx_syslog_order_number ON sys_log (order_number);

create table if not exists auth (
    guid         TEXT PRIMARY KEY DEFAULT replace(uuid_generate_v4()::text, '-', ''),
    auth_name    VARCHAR(255) DEFAULT '', -- 权限名称
    auth_url     VARCHAR(255) DEFAULT '', -- 权限路径/接口地址
    user_id      INT DEFAULT 0,           -- 所属用户/管理员ID
    pid          INT DEFAULT 0,           -- 父级权限ID
    sort         INT DEFAULT 0,           -- 排序
    icon         VARCHAR(255) DEFAULT '', -- 图标
    is_show      INT DEFAULT 1,           -- 是否显示(1显示;0隐藏)
    status       INT DEFAULT 1,           -- 状态(1启用;0禁用)
    create_id    INT DEFAULT 0,           -- 创建人ID
    update_id    INT DEFAULT 0,           -- 修改人ID
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_auth_user_id   ON auth (user_id);
CREATE INDEX idx_auth_pid       ON auth (pid);
CREATE INDEX idx_auth_create_id ON auth (create_id);
CREATE INDEX idx_auth_update_id ON auth (update_id);

create table if not exists role (
    guid         TEXT PRIMARY KEY DEFAULT replace(uuid_generate_v4()::text, '-', ''),
    role_name    VARCHAR(100) DEFAULT '', -- 角色名称
    detail       VARCHAR(255) DEFAULT '', -- 角色描述/说明
    status       INT DEFAULT 1,           -- 状态(1启用;0禁用)
    create_id    INT DEFAULT 0,           -- 创建人ID
    update_id    INT DEFAULT 0,           -- 修改人ID
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_role_role_name ON role (role_name);

create table if not exists role_auth (
    auth_id  INT NOT NULL,
    role_id  BIGINT NOT NULL,
    PRIMARY KEY (auth_id, role_id)
);
CREATE INDEX idx_role_auth_role_id ON role_auth (role_id);

create table if not exists admin (
    guid          TEXT PRIMARY KEY DEFAULT replace(uuid_generate_v4()::text, '-', ''),
    login_name    VARCHAR(32)  NOT NULL UNIQUE,   -- 登录名 --
    real_name     VARCHAR(32)  UNIQUE,            -- 真实姓名 --
    password      VARCHAR(100) NOT NULL,          -- 密码(加密后) --
    role_ids      VARCHAR(255) DEFAULT '',        -- 角色 ID 列表（字符串存 JSON/CSV） --
    phone         VARCHAR(11) UNIQUE,             -- 手机号 --
    email         VARCHAR(32),                    -- 邮箱 --
    salt          VARCHAR(255) DEFAULT '',        -- 密码盐 --
    last_login    INTEGER DEFAULT 0,              -- 最后登录时间戳 --
    last_ip       VARCHAR(255) DEFAULT '',        -- 最后登录 IP --
    status        INT DEFAULT 1,                  -- 状态(1启用;0禁用) --
    create_id     INT DEFAULT 0,                  -- 创建人 --
    update_id     INT DEFAULT 0,                  -- 修改人 --
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_admin_status ON admin (status);
CREATE INDEX idx_admin_create_id ON admin (create_id);
CREATE INDEX idx_admin_update_id ON admin (update_id);
CREATE INDEX idx_admin_last_login ON admin (last_login);

CREATE TABLE IF NOT EXISTS blocks (
    number        BIGINT PRIMARY KEY,              -- 区块高度
    hash          BYTEA        NOT NULL,            -- 区块 hash
    parent_hash   BYTEA        NOT NULL,            -- 父区块 hash
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP, -- 入库时间
    updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP  -- 更新时间
);
CREATE UNIQUE INDEX idx_blocks_number ON blocks (number);
CREATE UNIQUE INDEX idx_blocks_hash ON blocks (hash);

CREATE TABLE IF NOT EXISTS contract_events (
    guid             VARCHAR PRIMARY KEY,
    block_hash       VARCHAR NOT NULL,
    contract_address VARCHAR NOT NULL,
    transaction_hash VARCHAR NOT NULL,
    log_index        INTEGER NOT NULL,
    event_signature  VARCHAR NOT NULL,
    timestamp        INTEGER NOT NULL CHECK (timestamp > 0),
    rlp_bytes        VARCHAR NOT NULL,
    created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP, -- 入库时间
    updated_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP  -- 更新时间
);
CREATE INDEX IF NOT EXISTS contract_events_timestamp ON contract_events(timestamp);
CREATE INDEX IF NOT EXISTS contract_events_block_hash ON contract_events(block_hash);
CREATE INDEX IF NOT EXISTS contract_events_event_signature ON contract_events(event_signature);
CREATE INDEX IF NOT EXISTS contract_events_contract_address ON contract_events(contract_address);

CREATE TABLE IF NOT EXISTS event_blocks(
    guid          VARCHAR PRIMARY KEY,
    hash          VARCHAR NOT NULL UNIQUE,
    parent_hash   VARCHAR NOT NULL UNIQUE,
    number        UINT256 NOT NULL UNIQUE,
    timestamp     INTEGER NOT NULL UNIQUE CHECK (timestamp > 0),
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP, -- 入库时间
    updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP  -- 更新时间
);
CREATE INDEX IF NOT EXISTS event_blocks_timestamp ON event_blocks(timestamp);
CREATE INDEX IF NOT EXISTS event_blocks_number ON event_blocks(number);

CREATE TABLE IF NOT EXISTS liquidity_provider_deposits (
    guid                VARCHAR PRIMARY KEY,
    token_address       VARCHAR(42) NOT NULL,
    liquidity_provider  VARCHAR(42) NOT NULL,
    amount              UINT256 NOT NULL,
    start_time          BIGINT NOT NULL,
    end_time            BIGINT NOT NULL,
    block_number        UINT256 NOT NULL,
    staking_type        SMALLINT,
    lp_type             SMALLINT NOT NULL,
    tx_hash             VARCHAR NOT NULL UNIQUE,
    log_index           INT DEFAULT 0,
    created_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP, -- 入库时间
    updated_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP  -- 更新时间
);
CREATE INDEX IF NOT EXISTS idx_liquidity_provider_deposits_token ON liquidity_provider_deposits(token_address);
CREATE INDEX IF NOT EXISTS idx_liquidity_provider_deposits_provider ON liquidity_provider_deposits(liquidity_provider);

CREATE TABLE IF NOT EXISTS liquidity_provider_rewards (
    guid               VARCHAR PRIMARY KEY,
    liquidity_provider VARCHAR(42) NOT NULL,
    amount             UINT256 NOT NULL UNIQUE,
    reward_block       UINT256 NOT NULL,
    income_type        SMALLINT NOT NULL,
    block_number       UINT256 NOT NULL,
    tx_hash            VARCHAR NOT NULL UNIQUE,
    lp_type            SMALLINT NOT NULL,
    log_index          INT DEFAULT 0,
    created_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP, -- 入库时间
    updated_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP  -- 更新时间
);
CREATE INDEX IF NOT EXISTS idx_liquidity_provider_rewards_provider ON liquidity_provider_rewards(liquidity_provider);

CREATE TABLE IF NOT EXISTS lp_round_staking_over (
    guid VARCHAR PRIMARY KEY,
    liquidity_provider VARCHAR(42) NOT NULL,
    end_block          UINT256 NOT NULL,
    end_time           UINT256 NOT NULL,
    block_number       UINT256 NOT NULL,
    lp_type            SMALLINT NOT NULL,
    tx_hash            VARCHAR NOT NULL UNIQUE,
    log_index          INT DEFAULT 0,
    created_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP, -- 入库时间
    updated_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP  -- 更新时间
);
CREATE INDEX IF NOT EXISTS idx_lp_round_staking_over_provider ON lp_round_staking_over(liquidity_provider);

CREATE TABLE IF NOT EXISTS lp_claim_reward (
    guid                 VARCHAR PRIMARY KEY,
    liquidity_provider   VARCHAR(42) NOT NULL,
    withdraw_amount      UINT256 NOT NULL,
    to_prediction_amount UINT256 NOT NULL,
    lp_type              SMALLINT NOT NULL,
    block_number         UINT256 NOT NULL,,
    tx_hash              VARCHAR NOT NULL UNIQUE,
    log_index            INT DEFAULT 0,
    created_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP, -- 入库时间
    updated_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP  -- 更新时间
);
CREATE INDEX IF NOT EXISTS idx_lp_claim_reward_provider ON lp_claim_reward(liquidity_provider);

CREATE TABLE IF NOT EXISTS out_of_achieve_returns_node_exit (
    guid               VARCHAR PRIMARY KEY,
    liquidity_provider VARCHAR(42) NOT NULL,
    team_reward        UINT256 NOT NULL,
    block_number       UINT256 NOT NULL,
    lp_type            SMALLINT NOT NULL,
    tx_hash            VARCHAR NOT NULL UNIQUE,
    log_index          INT DEFAULT 0,
    created_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP, -- 入库时间
    updated_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP  -- 更新时间
);
CREATE INDEX IF NOT EXISTS idx_out_of_achieve_returns_provider ON out_of_achieve_returns_node_exit(liquidity_provider);

CREATE TABLE IF NOT EXISTS liquidity_added (
    guid       VARCHAR PRIMARY KEY,
    token_id   UINT256 NOT NULL,
    liquidity  UINT256 NOT NULL,
    amount0    UINT256 NOT NULL,
    amount1    UINT256 NOT NULL,
    lp_type    SMALLINT NOT NULL,
    tx_hash    VARCHAR NOT NULL UNIQUE,
    log_index  INT DEFAULT 0,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP, -- 入库时间
    updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP  -- 更新时间
);
CREATE INDEX IF NOT EXISTS idx_liquidity_added_token ON liquidity_added(token_id);

CREATE TABLE IF NOT EXISTS tokens_burned (
    guid          VARCHAR PRIMARY KEY,
    usdt_amount   UINT256 NOT NULL,
    tokens_burned UINT256 NOT NULL,
    block_number  UINT256 NOT NULL,
    tx_hash       VARCHAR NOT NULL UNIQUE,
    log_index     INT DEFAULT 0,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP, -- 入库时间
    updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP  -- 更新时间
);

CREATE TABLE IF NOT EXISTS deposit_usdt (
    guid          VARCHAR PRIMARY KEY,
    token_address VARCHAR(42) NOT NULL,
    sender        VARCHAR(42) NOT NULL,
    amount        UINT256 NOT NULL,
    block_number  UINT256 NOT NULL,
    tx_hash       VARCHAR NOT NULL UNIQUE,
    log_index     INT DEFAULT 0,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 入库时间
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- 更新时间
);
CREATE INDEX IF NOT EXISTS idx_deposit_usdt_token ON deposit_usdt(token_address);
CREATE INDEX IF NOT EXISTS idx_deposit_usdt_sender ON deposit_usdt(sender);

CREATE TABLE IF NOT EXISTS deposit (
    guid          VARCHAR PRIMARY KEY,
    token_address VARCHAR(42) NOT NULL,
    sender        VARCHAR(42) NOT NULL,
    amount        UINT256 NOT NULL,
    block_number  UINT256 NOT NULL,
    tx_hash       VARCHAR NOT NULL UNIQUE,
    log_index     INT DEFAULT  0,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 入库时间
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- 更新时间
);
CREATE INDEX IF NOT EXISTS idx_deposit_token ON deposit(token_address);
CREATE INDEX IF NOT EXISTS idx_deposit_sender ON deposit(sender);

CREATE TABLE IF NOT EXISTS withdraw (
    guid             VARCHAR PRIMARY KEY,
    token_address    VARCHAR(42) NOT NULL,
    sender           VARCHAR(42) NOT NULL,
    withdraw_address VARCHAR(42) NOT NULL,
    amount           UINT256 NOT NULL,
    block_number     UINT256 NOT NULL,
    tx_hash          VARCHAR NOT NULL UNIQUE,
    log_index        INT DEFAULT 0,
    created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP, -- 入库时间
    updated_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP  -- 更新时间
);
CREATE INDEX IF NOT EXISTS idx_withdraw_token ON withdraw(token_address);

CREATE TABLE IF NOT EXISTS node_reward (
    guid                     VARCHAR PRIMARY KEY,
    address                  VARCHAR(42) NOT NULL,
    invite_address           VARCHAR(42) NOT NULL,
    node_type                SMALLINT NOT NULL,
    normal_reward            UINT256 NOT NULL,
    direct_reward            UINT256 NOT NULL,
    team_reward              UINT256 NOT NULL,
    same_level_reward        UINT256 NOT NULL,
    token_fee_reward         UINT256 NOT NULL,
    child_token_fee_reward   UINT256 NOT NULL,
    prediction_reward        UINT256 NOT NULL,
    is_exit                  BOOLEAN DEFAULT FALSE,
    created_at               TIMESTAMP    DEFAULT CURRENT_TIMESTAMP, -- 入库时间
    updated_at               TIMESTAMP    DEFAULT CURRENT_TIMESTAMP  -- 更新时间
);
CREATE INDEX IF NOT EXISTS idx_node_reward ON node_reward(my_address);

CREATE TABLE IF NOT EXISTS node_reward_record (
    guid                VARCHAR PRIMARY KEY,
    address             VARCHAR(42) NOT NULL,
    reward              UINT256 NOT NULL,
    reward_type         SMALLINT NOT NULL,
    created_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP, -- 入库时间
    updated_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP  -- 更新时间
);
CREATE INDEX IF NOT EXISTS idx_node_reward_record ON node_reward_record(my_address);
