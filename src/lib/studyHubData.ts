export type ConnectorState =
  | "healthy"
  | "running"
  | "error"
  | "idle"
  | "unconfigured";

export type StudyHubConnector = {
  id: string;
  label: string;
  state: ConnectorState;
  lastStartedAt: string | null;
  lastSuccessAt: string | null;
  lastError: string | null;
};

export type StudyHubEvent = {
  id: string;
  courseSlug: string;
  courseTitle: string;
  kind: string;
  title: string;
  description: string | null;
  dueAt: string | null;
  startsAt: string | null;
  status: string;
  url: string | null;
  provider: string;
  updatedAt: string;
};

export type StudyHubSource = {
  id: string;
  courseSlug: string;
  courseTitle: string;
  kind: string;
  title: string;
  url: string | null;
  provider: string;
  privacyClass: string;
  updatedAt: string;
};

export type StudyHubDashboardData = {
  databaseConfigured: boolean;
  sourceCount: number;
  eventCount: number;
  upcoming: StudyHubEvent[];
  recentSources: StudyHubSource[];
  connectors: StudyHubConnector[];
};

export type StudyHubCourseData = {
  sourceCount: number;
  upcoming: StudyHubEvent[];
  recentSources: StudyHubSource[];
};

export type RetrievedStudySource = {
  id: string;
  citation: string;
  title: string;
  url: string | null;
  provider: string;
  content: string;
};
