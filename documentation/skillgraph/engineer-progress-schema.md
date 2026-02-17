# Engineer Progress JSON Schema

前端使用說明文檔

---

## 目錄

1. [概述](#概述)
2. [檔案結構與路徑](#檔案結構與路徑)
3. [Schema 完整定義](#schema-完整定義)
4. [欄位說明](#欄位說明)
5. [如何計算進度](#如何計算進度)
6. [跨人聚合分析](#跨人聚合分析)
7. [洞察指標與衍生計算](#洞察指標與衍生計算)
8. [版本管理](#版本管理)
9. [AI Bot 寫入規則](#ai-bot-寫入規則)
10. [前端 UI 建議](#前端-ui-建議)

---

## 概述

每位工程師有一個獨立的 JSON 檔案，記錄 AI 掃描機器人自動偵測到的技能解鎖進度。

### 核心概念

- **解鎖（Unlock）**：AI 機器人掃描工程師的代碼後，將偵測到的技能對應到 roadmap 的 subCheckpoint 並標記為已解鎖
- **二元狀態**：每個 subCheckpoint 只有「已解鎖」或「未解鎖」兩種狀態。出現在 `completions` 中 = 已解鎖，不存在 = 未解鎖
- **獨立追蹤**：Role roadmap 和 Skill roadmap 各自獨立追蹤，互不影響
- **無順序限制**：Level、Checkpoint、SubCheckpoint 之間沒有前後順序，完全取決於 AI 掃描結果

---

## 檔案結構與路徑

```
roadmapshthings/
├── engineers/                    # 工程師進度資料
│   ├── eng-001.json
│   ├── eng-002.json
│   └── ...
├── roadmaps/                     # Roadmap 定義（唯讀參考）
│   ├── role/
│   │   ├── web-development.json
│   │   ├── mobile-development.json
│   │   └── ...
│   └── skill/
│       ├── backend-frameworks.json
│       ├── programming-languages.json
│       └── ...
└── skill-role-mapping.json       # 技能-角色對照表
```

- **每人一檔**，檔名為 `{userId}.json`
- Roadmap 定義檔為唯讀參考，前端需要同時載入定義檔和進度檔來計算進度

---

## Schema 完整定義

```json
{
  "userId": "eng-001",
  "name": "Alice Chen",
  "createdAt": "2026-01-05T00:00:00Z",
  "lastScannedAt": "2026-02-13T08:00:00Z",

  "roadmaps": {
    "{type}:{roadmapName}": {
      "roadmapVersion": "1.0",
      "firstUnlockedAt": "2026-01-06T08:00:00Z",
      "lastActivityAt": "2026-02-13T08:00:00Z",
      "completions": {
        "{subCheckpointId}": {
          "firstDetectedAt": "2026-01-06T08:00:00Z",
          "lastDetectedAt": "2026-02-13T08:00:00Z",
          "detectionCount": 38
        }
      }
    }
  }
}
```

---

## 欄位說明

### Root 層級

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `userId` | string | 是 | 唯一識別碼，同時作為檔名（`{userId}.json`） |
| `name` | string | 是 | 工程師顯示名稱 |
| `createdAt` | ISO 8601 | 是 | Profile 建立時間 |
| `lastScannedAt` | ISO 8601 | 是 | AI 機器人最後一次掃描此人代碼的時間 |
| `roadmaps` | object | 是 | 所有已解鎖的 roadmap，見下方說明 |

### Roadmap 層級

Key 格式為 `"{type}:{roadmapName}"`，其中 `type` 為 `role` 或 `skill`，`roadmapName` 對應到 roadmap 定義檔的 `roadmap` 欄位。

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `roadmapVersion` | string | 是 | 對應到 roadmap 定義檔的 `version` 欄位，用於偵測版本漂移 |
| `firstUnlockedAt` | ISO 8601 | 是 | 此 roadmap 中第一個 subCheckpoint 被解鎖的時間 |
| `lastActivityAt` | ISO 8601 | 是 | 最後一次有新解鎖或被重新偵測的時間 |
| `completions` | object | 是 | 已解鎖的 subCheckpoint 集合 |

**Roadmap key 範例：**

| Key | 對應定義檔 | Roadmap 名稱 |
|-----|-----------|-------------|
| `role:Frontend` | `roadmaps/role/web-development.json` | Frontend |
| `role:Backend` | `roadmaps/role/web-development.json` | Backend |
| `role:Full Stack` | `roadmaps/role/web-development.json` | Full Stack |
| `skill:Node.js` | `roadmaps/skill/backend-frameworks.json` | Node.js |
| `skill:Django` | `roadmaps/skill/backend-frameworks.json` | Django |

> **注意：** 同一個定義檔可能包含多個 roadmap（例如 `web-development.json` 包含 Frontend、Backend、Full Stack 等）。前端需要用 `roadmapName` 在定義檔的 array 中找到對應的 roadmap object。

### SubCheckpoint（Completion）層級

Key 為 subCheckpoint 的 `id`，對應到 roadmap 定義中的 `subCheckpoints[].id`。

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `firstDetectedAt` | ISO 8601 | 是 | 第一次被 AI 偵測到的時間 |
| `lastDetectedAt` | ISO 8601 | 是 | 最後一次被 AI 偵測到的時間 |
| `detectionCount` | integer | 是 | 總共被偵測到幾次（≥ 1） |

---

## 如何計算進度

### 步驟一：載入資料

```javascript
// 1. 載入 roadmap 定義
const webDevRoadmaps = await fetch('/roadmaps/role/web-development.json').then(r => r.json());
const frontendDef = webDevRoadmaps.find(r => r.roadmap === 'Frontend');

// 2. 載入使用者進度
const userProgress = await fetch('/engineers/eng-001.json').then(r => r.json());
const userFrontend = userProgress.roadmaps['role:Frontend'];
```

### 步驟二：計算單一 Roadmap 的進度

```javascript
function getRoadmapProgress(roadmapDef, userRoadmap) {
  if (!userRoadmap) {
    return { total: 0, completed: 0, percent: 0, byLevel: {}, byCheckpoint: {} };
  }

  const completionIds = new Set(Object.keys(userRoadmap.completions));
  const byLevel = {};
  const byCheckpoint = {};

  for (const level of roadmapDef.levels) {
    const levelSubs = [];

    for (const checkpoint of level.checkpoints) {
      const totalSubs = checkpoint.subCheckpoints.length;
      const doneSubs = checkpoint.subCheckpoints.filter(s => completionIds.has(s.id)).length;

      byCheckpoint[checkpoint.id] = {
        title: checkpoint.title,
        level: level.level,
        total: totalSubs,
        completed: doneSubs,
        percent: Math.round((doneSubs / totalSubs) * 100)
      };

      levelSubs.push(...checkpoint.subCheckpoints);
    }

    const totalInLevel = levelSubs.length;
    const doneInLevel = levelSubs.filter(s => completionIds.has(s.id)).length;

    byLevel[level.level] = {
      label: level.label,
      total: totalInLevel,
      completed: doneInLevel,
      percent: Math.round((doneInLevel / totalInLevel) * 100)
    };
  }

  const total = Object.values(byLevel).reduce((s, l) => s + l.total, 0);
  const completed = Object.values(byLevel).reduce((s, l) => s + l.completed, 0);

  return {
    total,
    completed,
    percent: Math.round((completed / total) * 100),
    byLevel,
    byCheckpoint
  };
}

// 使用範例
const progress = getRoadmapProgress(frontendDef, userFrontend);
// → {
//     total: 29,
//     completed: 28,
//     percent: 97,
//     byLevel: {
//       basic:        { label: "Basic",        total: 12, completed: 12, percent: 100 },
//       intermediate: { label: "Intermediate", total: 14, completed: 10, percent: 71  },
//       advanced:     { label: "Advanced",     total: 12, completed: 6,  percent: 50  }
//     },
//     byCheckpoint: {
//       internet: { title: "Internet", level: "basic", total: 3, completed: 3, percent: 100 },
//       html:     { title: "HTML",     level: "basic", total: 3, completed: 3, percent: 100 },
//       ...
//     }
//   }
```

### 步驟三：列出使用者所有 Roadmap 的概覽

```javascript
function getUserOverview(userProgress, allRoadmapDefs) {
  const overview = [];

  for (const [key, userRoadmap] of Object.entries(userProgress.roadmaps)) {
    const [type, roadmapName] = key.split(':');
    const def = findRoadmapDef(allRoadmapDefs, type, roadmapName);

    if (!def) {
      // roadmap 定義不存在（可能已被移除），跳過或標記
      overview.push({ key, type, roadmapName, status: 'orphaned' });
      continue;
    }

    const progress = getRoadmapProgress(def, userRoadmap);

    overview.push({
      key,
      type,
      roadmapName,
      roadmapVersion: userRoadmap.roadmapVersion,
      firstUnlockedAt: userRoadmap.firstUnlockedAt,
      lastActivityAt: userRoadmap.lastActivityAt,
      ...progress
    });
  }

  // 按 lastActivityAt 排序，最近活躍的排最前
  return overview.sort((a, b) =>
    new Date(b.lastActivityAt) - new Date(a.lastActivityAt)
  );
}

// 輔助函式：在所有定義檔中找到指定 roadmap
function findRoadmapDef(allDefs, type, roadmapName) {
  // allDefs 是一個 object: { 'web-development': [...], 'backend-frameworks': [...], ... }
  for (const roadmaps of Object.values(allDefs)) {
    const found = roadmaps.find(r => r.roadmap === roadmapName && r.type === type);
    if (found) return found;
  }
  return null;
}
```

---

## 跨人聚合分析

### 載入所有工程師資料

```javascript
async function loadAllEngineers(engineerIds) {
  const promises = engineerIds.map(id =>
    fetch(`/engineers/${id}.json`).then(r => r.json())
  );
  return Promise.all(promises);
}
```

### 團隊技能覆蓋率（Team Skill Coverage）

某張 roadmap 中，每個 subCheckpoint 有多少人解鎖了？

```javascript
function getTeamCoverage(allEngineers, roadmapKey, roadmapDef) {
  const totalEngineers = allEngineers.length;
  const coverage = {};

  // 初始化所有 subCheckpoints
  for (const level of roadmapDef.levels) {
    for (const cp of level.checkpoints) {
      for (const sub of cp.subCheckpoints) {
        coverage[sub.id] = {
          title: sub.title,
          level: level.level,
          checkpoint: cp.title,
          unlockedBy: 0,
          unlockedPercent: 0,
          totalDetections: 0,
          avgDetectionCount: 0,
          engineers: []   // 哪些人解鎖了
        };
      }
    }
  }

  // 聚合
  for (const eng of allEngineers) {
    const roadmap = eng.roadmaps[roadmapKey];
    if (!roadmap) continue;

    for (const [subId, data] of Object.entries(roadmap.completions)) {
      if (!coverage[subId]) continue;  // 忽略孤兒 ID
      coverage[subId].unlockedBy++;
      coverage[subId].totalDetections += data.detectionCount;
      coverage[subId].engineers.push({
        userId: eng.userId,
        name: eng.name,
        firstDetectedAt: data.firstDetectedAt,
        detectionCount: data.detectionCount
      });
    }
  }

  // 計算百分比和平均值
  for (const item of Object.values(coverage)) {
    item.unlockedPercent = Math.round((item.unlockedBy / totalEngineers) * 100);
    item.avgDetectionCount = item.unlockedBy > 0
      ? Math.round(item.totalDetections / item.unlockedBy)
      : 0;
  }

  return coverage;
}
```

### 團隊 Roadmap 擁有率（Team Roadmap Adoption）

哪些 roadmap 最多人在走？

```javascript
function getTeamRoadmapAdoption(allEngineers) {
  const adoption = {};

  for (const eng of allEngineers) {
    for (const [key, roadmap] of Object.entries(eng.roadmaps)) {
      if (!adoption[key]) {
        adoption[key] = {
          roadmapKey: key,
          engineerCount: 0,
          avgCompletionCount: 0,
          totalCompletions: 0
        };
      }
      adoption[key].engineerCount++;
      adoption[key].totalCompletions += Object.keys(roadmap.completions).length;
    }
  }

  for (const item of Object.values(adoption)) {
    item.avgCompletionCount = Math.round(item.totalCompletions / item.engineerCount);
  }

  return Object.values(adoption).sort((a, b) => b.engineerCount - a.engineerCount);
}
```

---

## 洞察指標與衍生計算

以下指標可以從 `firstDetectedAt`、`lastDetectedAt`、`detectionCount` 三個欄位推導：

### 單一 SubCheckpoint 層級

| 指標 | 計算方式 | 意義 |
|------|---------|------|
| **熟練度信號** | `detectionCount` ≥ 15 且 `lastDetectedAt` 在近 7 天內 | 持續高頻使用的核心技能 |
| **一次性接觸** | `detectionCount` = 1 | 可能只是偶然碰到，尚未真正掌握 |
| **遺忘風險** | `detectionCount` ≥ 10 但 `lastDetectedAt` 超過 30 天前 | 曾經常用但已停止使用 |
| **偵測頻率** | `detectionCount / daysBetween(firstDetectedAt, lastDetectedAt)` | 平均每天被偵測到的次數 |

```javascript
function getSubCheckpointInsight(completion) {
  const now = new Date();
  const first = new Date(completion.firstDetectedAt);
  const last = new Date(completion.lastDetectedAt);
  const daysSinceFirst = (now - first) / (1000 * 60 * 60 * 24);
  const daysSinceLast = (now - last) / (1000 * 60 * 60 * 24);
  const activeDays = Math.max(1, (last - first) / (1000 * 60 * 60 * 24));
  const frequency = completion.detectionCount / activeDays;

  let status;
  if (completion.detectionCount >= 15 && daysSinceLast <= 7) {
    status = 'core_skill';       // 核心技能，持續使用中
  } else if (completion.detectionCount >= 10 && daysSinceLast > 30) {
    status = 'fading';           // 遺忘風險，超過 30 天未偵測
  } else if (completion.detectionCount === 1) {
    status = 'one_time';         // 一次性接觸
  } else if (daysSinceLast <= 14) {
    status = 'active';           // 活躍使用中
  } else {
    status = 'inactive';         // 不活躍
  }

  return { status, frequency, daysSinceFirst, daysSinceLast };
}
```

### 個人層級

| 指標 | 計算方式 | 意義 |
|------|---------|------|
| **學習速度** | 過去 30 天內新增的 completion 數量（`firstDetectedAt` 在近 30 天） | 這個人的技能成長速度 |
| **技能廣度** | 解鎖的 roadmap 總數 | 涉獵的領域有多廣 |
| **技能深度** | 單一 roadmap 的完成百分比 | 在某個領域鑽研有多深 |
| **活躍度** | `lastScannedAt` 與當前時間的差距 | 最近有沒有在寫 code |

```javascript
function getEngineerInsights(userProgress, allRoadmapDefs) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  let newCompletionsLast30Days = 0;
  let totalCompletions = 0;
  let coreSkillCount = 0;
  let fadingSkillCount = 0;

  for (const roadmap of Object.values(userProgress.roadmaps)) {
    for (const completion of Object.values(roadmap.completions)) {
      totalCompletions++;
      if (new Date(completion.firstDetectedAt) >= thirtyDaysAgo) {
        newCompletionsLast30Days++;
      }
      const insight = getSubCheckpointInsight(completion);
      if (insight.status === 'core_skill') coreSkillCount++;
      if (insight.status === 'fading') fadingSkillCount++;
    }
  }

  return {
    roadmapCount: Object.keys(userProgress.roadmaps).length,
    totalCompletions,
    newCompletionsLast30Days,
    learningVelocity: Math.round(newCompletionsLast30Days / 30 * 7), // per week
    coreSkillCount,
    fadingSkillCount,
    daysSinceLastScan: Math.round((now - new Date(userProgress.lastScannedAt)) / (1000 * 60 * 60 * 24))
  };
}
```

---

## 版本管理

### Roadmap 定義檔需增加 `version` 欄位

```json
{
  "roadmap": "Frontend",
  "group": "Web Development",
  "type": "role",
  "version": "1.0",
  "levels": [ ... ]
}
```

### 版本漂移偵測

當 roadmap 定義更新時，檢查哪些工程師的進度資料還停留在舊版：

```javascript
function detectVersionDrift(allEngineers, roadmapKey, currentVersion) {
  return allEngineers
    .filter(eng => {
      const roadmap = eng.roadmaps[roadmapKey];
      return roadmap && roadmap.roadmapVersion !== currentVersion;
    })
    .map(eng => ({
      userId: eng.userId,
      name: eng.name,
      currentVersion: eng.roadmaps[roadmapKey].roadmapVersion,
      expectedVersion: currentVersion
    }));
}
```

### 版本更新策略

| 變更類型 | 對使用者進度的影響 | 處理方式 |
|---------|-------------------|---------|
| **新增** subCheckpoint | 無影響，前端自動顯示為「未解鎖」 | 不需動 user JSON |
| **刪除** subCheckpoint | user JSON 中出現孤兒 key | 跑 migration script 清理 |
| **重命名** subCheckpoint ID | 等同「刪除舊的 + 新增新的」 | 跑 migration script 搬移資料 |
| **調整** checkpoint/level 歸屬 | 無影響（扁平結構不記錄歸屬） | 不需動 user JSON |

### Migration Script 範例

```javascript
function migrateUserProgress(userJson, roadmapKey, migrations) {
  const roadmap = userJson.roadmaps[roadmapKey];
  if (!roadmap) return userJson;

  for (const { action, oldId, newId } of migrations) {
    if (action === 'rename' && roadmap.completions[oldId]) {
      roadmap.completions[newId] = roadmap.completions[oldId];
      delete roadmap.completions[oldId];
    }
    if (action === 'delete') {
      delete roadmap.completions[oldId];
    }
  }

  roadmap.roadmapVersion = migrations.targetVersion;
  return userJson;
}

// 使用範例
migrateUserProgress(userJson, 'role:Frontend', {
  targetVersion: '1.1',
  migrations: [
    { action: 'rename', oldId: 'old-checkpoint', newId: 'new-checkpoint' },
    { action: 'delete', oldId: 'deprecated-checkpoint' }
  ]
});
```

---

## AI Bot 寫入規則

### 每次掃描的寫入邏輯

```
1. 載入 engineers/{userId}.json
2. 更新 lastScannedAt = 當前時間
3. 對於每個偵測到的 (roadmapKey, subCheckpointId)：
   a. 如果 roadmapKey 不存在 → 建立新的 roadmap entry
   b. 如果 subCheckpointId 不存在 → 新增 completion，detectionCount = 1
   c. 如果 subCheckpointId 已存在 → 更新 lastDetectedAt，detectionCount += 1
4. 更新對應 roadmap 的 lastActivityAt
5. 同步 roadmapVersion 為最新定義版本
6. 儲存檔案
```

### 重要規則

- **不要刪除已有的 completions**：即使某次掃描沒有偵測到某個技能，也不代表工程師「忘記了」，不應移除
- **timestamp 使用 UTC ISO 8601 格式**：`2026-02-13T08:00:00Z`
- **detectionCount 只增不減**

---

## 前端 UI 建議

### 個人儀表板（Profile Dashboard）

| 區塊 | 資料來源 | 展示形式 |
|------|---------|---------|
| Roadmap 列表 | `Object.keys(roadmaps)` | 卡片列表，顯示完成百分比圓環 |
| 單一 Roadmap 詳情 | `completions` + roadmap 定義 | 三層進度條（Basic / Intermediate / Advanced） |
| SubCheckpoint 清單 | `completions` + roadmap 定義 | 勾選清單，已完成的顯示偵測次數 badge |
| 時間軸 | 所有 `firstDetectedAt` 排序 | 活動時間線，顯示每天解鎖了什麼 |
| 技能洞察 | `detectionCount` + timestamps | 核心技能 / 遺忘風險 / 一次性接觸的分類標籤 |

### 團隊儀表板（Team Dashboard）

| 區塊 | 資料來源 | 展示形式 |
|------|---------|---------|
| Roadmap 採用率 | 跨人聚合 roadmap keys | 水平長條圖，按人數排序 |
| 技能覆蓋率 Heatmap | `getTeamCoverage()` | 矩陣熱力圖：X 軸 = subCheckpoints, Y 軸 = 工程師 |
| 團隊成長曲線 | 所有人的 `firstDetectedAt` 按周聚合 | 折線圖，每周新增解鎖數量 |
| 技能缺口分析 | 覆蓋率 < 30% 的 subCheckpoints | 紅色警示列表 |
| 學習排行榜 | `newCompletionsLast30Days` 排序 | 排行榜表格 |

---

## 附錄：型別定義（TypeScript）

```typescript
/** 工程師進度檔案的完整型別 */
interface EngineerProgress {
  userId: string;
  name: string;
  createdAt: string;          // ISO 8601
  lastScannedAt: string;      // ISO 8601
  roadmaps: Record<string, RoadmapProgress>;
}

/** 單一 Roadmap 的進度 */
interface RoadmapProgress {
  roadmapVersion: string;
  firstUnlockedAt: string;    // ISO 8601
  lastActivityAt: string;     // ISO 8601
  completions: Record<string, SubCheckpointCompletion>;
}

/** 單一 SubCheckpoint 的完成記錄 */
interface SubCheckpointCompletion {
  firstDetectedAt: string;    // ISO 8601
  lastDetectedAt: string;     // ISO 8601
  detectionCount: number;     // >= 1
}

/**
 * Roadmap key 格式: "{type}:{roadmapName}"
 * - type: "role" | "skill"
 * - roadmapName: 對應 roadmap 定義檔的 roadmap 欄位
 *
 * 範例:
 * - "role:Frontend"
 * - "role:Backend"
 * - "skill:Node.js"
 * - "skill:Django"
 */
type RoadmapKey = `${'role' | 'skill'}:${string}`;
```
