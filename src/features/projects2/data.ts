import {
  PROJECT_PIPELINE_STATUS_OPTIONS,
  type ProjectPipelineStatus,
} from './projectPipelineStatus';
import { normalizeChurnRisk, PROJECT_CHURN_RISK_LEVELS } from './projectChurnRisk';
import { DEFAULT_LINK_ORDER } from './projectLinks';
import { parseCountryFromCity, cityWithoutCountrySuffix } from './projectCountries';
import type {
  Project,
  ProjectQuickLinks,
  ProjectStatus,
  ProjectTeamAssignment,
  ProjectTeamPositionId,
} from './types';

const PROJECT_COUNT = 40;

const STUDIO_DIRECTIONS = [
  'Blackwork',
  'Realism',
  'Fine Line',
  'Traditional',
  'Cyber Sigil',
  'Irezumi',
  'Color',
  'Lettering',
] as const;

const CITIES = [
  'Київ, UA',
  'Львів, UA',
  'Одеса, UA',
  'Харків, UA',
  'Дніпро, UA',
  'Варшава, PL',
  'Berlin, DE',
  'Prague, CZ',
] as const;

const PM_ID = 'sofia';

function instagramFromUsername(username: string): string {
  const handle = username.replace(/^@/, '');
  return `https://instagram.com/${handle}`;
}

function defaultQuickLinks(username: string, slug: string): ProjectQuickLinks {
  return {
    instagram: instagramFromUsername(username),
    facebookAds: `https://business.facebook.com/adsmanager/manage/campaigns?project=${slug}`,
    googleDrive: `https://drive.google.com/drive/folders/${slug}`,
    reporting: `https://looker.example.com/projects/${slug}`,
    website: `https://${slug.replace(/-/g, '')}.example.com`,
  };
}

function projectStatusFromPipeline(pipelineStatus: ProjectPipelineStatus): ProjectStatus {
  if (
    pipelineStatus === 'Pause' ||
    pipelineStatus === 'Temporarily stopped' ||
    pipelineStatus === 'Stopped working'
  ) {
    return 'paused';
  }
  return 'active';
}

function assign(
  id: string,
  memberId: string,
  position: ProjectTeamPositionId,
): ProjectTeamAssignment {
  return { id, memberId, position };
}

function teamAssignmentsForIndex(index: number): ProjectTeamAssignment[] {
  const variant = index % 3;
  const pm = assign(`ta-${index}-pm`, PM_ID, 'pm');
  const direct = assign(`ta-${index}-dm`, 'direct-mgr', 'team_lead');

  if (variant === 0) {
    return [assign(`ta-${index}-fb`, 'facebook', 'media_buyer'), direct, pm];
  }
  if (variant === 1) {
    return [assign(`ta-${index}-ga`, 'google-ads', 'media_buyer'), direct, pm];
  }
  return [
    assign(`ta-${index}-fb`, 'facebook', 'media_buyer'),
    assign(`ta-${index}-ga`, 'google-ads', 'media_buyer'),
    direct,
    pm,
  ];
}

function pipelineStatusForIndex(index: number): ProjectPipelineStatus {
  return PROJECT_PIPELINE_STATUS_OPTIONS[index % PROJECT_PIPELINE_STATUS_OPTIONS.length];
}

function buildProject(index: number): Project {
  const n = index + 1;
  const slug = `studio-${String(n).padStart(2, '0')}`;
  const username = `@${slug.replace(/-/g, '.')}`;
  const direction = STUDIO_DIRECTIONS[index % STUDIO_DIRECTIONS.length];
  const cityRaw = CITIES[index % CITIES.length];
  const country = parseCountryFromCity(cityRaw) ?? 'UA';
  const city = cityWithoutCountrySuffix(cityRaw);
  const pipelineStatus = pipelineStatusForIndex(index);
  const status = projectStatusFromPipeline(pipelineStatus);
  const joinedYear = 2021 + (index % 5);
  const joinedMonth = String((index % 12) + 1).padStart(2, '0');
  const joinedDay = String((index % 27) + 1).padStart(2, '0');

  return {
    id: slug,
    username,
    name: `Ink Studio ${n}`,
    role: direction,
    tier: `L${50 + (index % 35)}`,
    hue: 250,
    status,
    country,
    city,
    pipelineStatus,
    churnRisk: normalizeChurnRisk(PROJECT_CHURN_RISK_LEVELS[index % PROJECT_CHURN_RISK_LEVELS.length]),
    teamAssignments: teamAssignmentsForIndex(index),
    result: status === 'paused' ? 'На паузі' : 'В процесі',
    niche: 'Tattoo studio',
    aboutClient: `Демо-проєкт ${n} · ${direction}. Статус: ${pipelineStatus}.`,
    mbPmComment: `Facebook / Google / Direct Manager — ротація команди за шаблоном ${(index % 3) + 1}.`,
    hasTestimonials: index % 4 === 0,
    hasCase: index % 5 === 0,
    paidAt: index % 3 === 0 ? `${joinedDay}.${joinedMonth}.${joinedYear}` : '',
    startDate: `${joinedDay}.${joinedMonth}.${joinedYear}`,
    activeDate: `${joinedDay}.${joinedMonth}.${joinedYear + 1}`,
    endDate: pipelineStatus === 'Stopped working' ? `01.01.${joinedYear + 2}` : '',
    chatId: slug,
    chatType: 'Telegram',
    birthday: `${joinedDay}.${joinedMonth}.${1988 + (index % 10)}`,
    joined: `${joinedDay}.${joinedMonth}.${joinedYear}`,
    conditions: `Студія · ${direction}. Pipeline: ${pipelineStatus}.`,
    dream: 'Розширити онлайн-запис',
    hobby: 'Креатив, соцмережі',
    email: `${slug}@digitalink.team`,
    phone: `+380 ${50 + (index % 40)} ${100 + index} ${10 + index} ${index}`,
    clientContacts: [
      {
        id: `contact-${slug}`,
        label: '',
        email: `${slug}@digitalink.team`,
        phone: `+380 ${50 + (index % 40)} ${100 + index} ${10 + index} ${index}`,
      },
    ],
    referralCode: `INK${String(n).padStart(4, '0')}`,
    clientArticleShares:
      n === 30
        ? [
            {
              id: 'share-demo-1',
              articleId: 'art-onboarding',
              comment: 'Надіслав на старті співпраці',
              sentAt: '15.04.2026',
            },
            {
              id: 'share-demo-2',
              articleId: 'art-facebook-ads',
              comment: '',
              sentAt: '',
            },
          ]
        : [],
    telegram: `@${slug.replace(/-/g, '_')}`,
    telegramId: `${500000000 + index}`,
    comments: `Seed #${n} для Kanban / фільтрів.`,
    quickLinks: defaultQuickLinks(username, slug),
    linkOrder: [...DEFAULT_LINK_ORDER],
    settingExtras: [],
    customLinks: [],
  };
}

export const projects: Project[] = Array.from({ length: PROJECT_COUNT }, (_, index) =>
  buildProject(index),
);
