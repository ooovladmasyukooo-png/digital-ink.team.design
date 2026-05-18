# Design Handoff For TypeScript Agent

Цей документ для іншого агента, який буде застосовувати поточний дизайн у проєкті на TypeScript.

Мета: перенести UI з поточного прототипу `Aurora CRM.html`, `app.jsx`, `styles.css` у TypeScript-проєкт так, щоб кожну головну вкладку можна було розробляти, тестувати й змінювати незалежно від головної оболонки застосунку.

## Поточний Прототип

Поточний інтерфейс зібраний як один React-прототип:

- `Aurora CRM.html` - HTML-обгортка.
- `app.jsx` - усі React-компоненти, мокові дані та логіка вкладок.
- `styles.css` - усі дизайн-токени, layout, компоненти та стилі екранів.

Головна навігація зараз керується станом `active` у компоненті `App`. Вкладки:

- `crm` - воронка продажів.
- `projects` - проєкти.
- `analytics` - аналітика.
- `finance` - фінанси.
- `team` - команда.

## Бажана Архітектура

Потрібно розділити застосунок на незалежні feature-модулі. Головна оболонка має лише показувати навігацію, topbar і активний модуль, але не містити внутрішню логіку вкладок.

Рекомендована структура:

```text
src/
  app/
    App.tsx
    AppShell.tsx
    navigation.ts
  shared/
    components/
      Avatar.tsx
      Chip.tsx
      Icon.tsx
      Topbar.tsx
      Sidebar.tsx
    styles/
      tokens.css
      globals.css
    types/
      common.ts
  features/
    crm/
      CrmPage.tsx
      components/
      data.ts
      types.ts
    projects/
      ProjectsPage.tsx
      components/
      data.ts
      types.ts
    analytics/
      AnalyticsPage.tsx
      components/
      data.ts
      types.ts
    finance/
      FinancePage.tsx
      components/
      data.ts
      types.ts
    team/
      TeamPage.tsx
      components/
      data.ts
      types.ts
```

Кожна feature-папка повинна мати власну сторінку, локальні компоненти, типи й мокові дані. Shared-компоненти використовувати тільки для справді повторюваних елементів.

## Вимога До Незалежності Вкладок

Кожна головна вкладка має розроблятися незалежно від інших:

- вкладка не повинна напряму імпортувати компоненти з іншої feature-папки;
- мокові дані вкладки мають лежати поруч із цією вкладкою;
- внутрішній стан вкладки має бути локальним для її page-компонента або її локальних hooks;
- головний `App` не повинен знати про таблиці, форми, картки чи внутрішні subtabs конкретної вкладки;
- shared-рівень не повинен перетворюватися на місце для всієї бізнес-логіки.

Якщо вкладку треба тимчасово розробляти окремо, бажано мати можливість відкрити її напряму через route або story/dev entry.

## TypeScript Типізація

Для кожного модуля винести типи окремо:

```ts
export type TeamMemberStatus = 'active' | 'paused';

export interface TeamMember {
  id: string;
  username: string;
  name: string;
  role: string;
  tier: string;
  hue: number;
  status: TeamMemberStatus;
  city: string;
  birthday: string;
  joined: string;
  conditions: string;
  dream: string;
  hobby: string;
  email: string;
  phone: string;
}
```

Так само зробити для `Lead`, `PipelineStage`, `Transaction`, `Project`, `Notification`.

Не залишати великі untyped масиви всередині компонентів.

## Shared UI Компоненти

Винести з `app.jsx` у shared:

- `Icon`
- `Avatar`
- `Chip`
- `Topbar`
- `Sidebar`
- базові кнопки, якщо у проєкті немає власної design-system кнопки

Компоненти повинні мати чіткі props-типи. Наприклад:

```ts
interface AvatarProps {
  name: string;
  hue?: number;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
}
```

## Team Вкладка

Вкладка `team` найбільша і її варто розділити глибше.

Рекомендовано:

```text
features/team/
  TeamPage.tsx
  TeamList.tsx
  TeamDetail.tsx
  components/
    EditableField.tsx
    MemberCard.tsx
    ProfileHero.tsx
    DangerZone.tsx
  tabs/
    ProfileTab.tsx
    ActivityTab.tsx
    DealsTab.tsx
    PayoutsTab.tsx
    AccessTab.tsx
    NotesTab.tsx
    SettingsTab.tsx
  data.ts
  types.ts
```

Внутрішні subtabs команди також мають бути незалежними файлами. `TeamDetail` має лише вибирати активний subtab і передавати `member`.

Остання дизайнерська правка профілю:

- статус у profile hero прибраний;
- avatar зменшений;
- поля редагування мають виглядати як компактні плашки;
- профіль має бути щільнішим по вертикалі;
- статус не показувати у верхньому profile-блоці.

## Стилі Та Токени

Поточні CSS-змінні з `:root` потрібно перенести у `tokens.css` або в систему теми проєкту:

```css
:root {
  --bg: #0a0a0b;
  --bg-1: #0d0d0f;
  --bg-2: #131316;
  --bg-3: #1a1a1e;
  --line: #232328;
  --line-2: #2d2d33;
  --txt: #e8e8ea;
  --txt-2: #a1a1a8;
  --txt-3: #6b6b73;
  --red: #ef4444;
  --green: #10b981;
  --amber: #f59e0b;
  --blue: #3b82f6;
  --purple: #a855f7;
}
```

Якщо в цільовому TypeScript-проєкті вже є theme/tokens, не дублювати нову систему. Потрібно замапити кольори й радіуси на існуючі токени.

## Правила Переносу

1. Не переносити все як один великий `App.tsx`.
2. Спочатку створити shell і navigation.
3. Далі переносити вкладки по одній, кожну в окремий feature-модуль.
4. Після переносу вкладки перевіряти її незалежно.
5. Повторювані UI-елементи виносити у shared тільки після другого реального використання.
6. Не змішувати мокові дані різних вкладок.
7. Не прив'язувати feature-модулі до конкретного порядку вкладок у sidebar.

## Очікуваний Результат

У результаті має бути TypeScript-реалізація, де:

- головна оболонка відповідає тільки за layout і навігацію;
- кожна вкладка є окремим модулем;
- вкладки можна розробляти незалежно;
- дизайн відповідає поточному темному Aurora CRM UI;
- профіль у Team вкладці компактний, без status-сегмента, з avatar меншого розміру та editable-полями у вигляді плашок.
