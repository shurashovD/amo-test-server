export type AmoAuthCodeExchangePayload = {
  client_id: string;
  client_secret: string;
  grant_type: 'authorization_code';
  code: string;
  redirect_uri: string;
};

export type AmoAuthCodeExchangeResponse = {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
};

export type AmoRefreshTokenPayload = {
  client_id: string;
  client_secret: string;
  grant_type: 'refresh_token';
  refresh_token: string;
  redirect_uri: string;
};

export type AmoRefreshTokenResponse = object;

export type AmoGetEntitiesResponse<Embedded> = {
  _page: number;
  _links: object;
  _embedded: Embedded;
};

export type AmoLinks = {
  self: {
    href: string;
  };
} & object;

export type AmoLead = {
  id: number;
  name: string;
  price: number;
  responsible_user_id: number;
  group_id: number;
  status_id: number;
  pipeline_id: number;
  loss_reason_id: number | null;
  created_by: number;
  updated_by: number;
  created_at: number;
  updated_at: number;
  closed_at: number | null;
  closest_task_at: number | null;
  is_deleted: false;
  custom_fields_values: Array<object> | null;
  score: number | null;
  account_id: number;
  labor_cost: number | null;
  _links: AmoLinks;
};

export type AmoContact = {
  id: number;
  email?: string;
  name: string;
  phone?: string;
} & object;

export type AmoPipeline = {
  id: number;
  _embedded: {
    statuses: AmoStatus[];
  };
};

export type AmoStatus = {
  id: number;
  name: string;
  sort: number;
  is_editable: boolean;
  pipeline_id: number;
  color: string;
  type: number;
  account_id: number;
  _links: AmoLinks;
};

export type AmoUser = {
  id: number;
  name: string;
  email?: string;
} & object;

export type Lead = Pick<AmoLead, 'id' | 'name' | 'price' | 'created_at'> & {
  contacts: Pick<AmoContact, 'id' | 'email' | 'name' | 'phone'>[];
  status: Pick<AmoStatus, 'id' | 'name' | 'color'>;
  user: Pick<AmoUser, 'id' | 'name' | 'email'>;
};

export type Params = {
  with?: string;
  page?: number;
  limit?: number;
  query?: string;
  filter?: object;
  order?: object;
};
