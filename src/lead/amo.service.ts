import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  AmoContact,
  AmoGetEntitiesResponse,
  AmoLead,
  AmoPipeline,
  AmoStatus,
  AmoUser,
  Lead,
  Params,
} from '../types';

const domain = 'https://shurashovd.amocrm.ru';

const paths = {
  oauth: '/oauth2/access_token',
  amojoId: '/api/v4/account?with=amojo_id',
  catalogs: '/api/v4/catalogs',
  contacts: '/api/v4/contacts',
  contactsCustomFields: '/api/v4/contacts/custom_fields',
  pipelines: '/api/v4/leads/pipelines',
  trade: '/api/v4/leads',
  tasks: '/api/v4/tasks',
  users: '/api/v4/users',
};

@Injectable()
export class AmoService {
  private readonly _token =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImQ5N2Y1ODYxNzE5MTU4MjgxMDQ4Y2Y5NTc2NWNmOTI1NjQ3NDRjYzBlNzE5NzFlZGE1ODliNjQ0N2JmNzEyODc2ZDQ3MWQxYTM3MGM2MWZiIn0.eyJhdWQiOiI2ZWQwMzI2ZS1mYWIzLTQ4NmQtOGVhZi05ODljNzdkOWFjYTYiLCJqdGkiOiJkOTdmNTg2MTcxOTE1ODI4MTA0OGNmOTU3NjVjZjkyNTY0NzQ0Y2MwZTcxOTcxZWRhNTg5YjY0NDdiZjcxMjg3NmQ0NzFkMWEzNzBjNjFmYiIsImlhdCI6MTcxODIxMzIxMywibmJmIjoxNzE4MjEzMjEzLCJleHAiOjE4NjQ1OTg0MDAsInN1YiI6IjExMTUwOTY2IiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMxNzk2NzM4LCJiYXNlX2RvbWFpbiI6ImFtb2NybS5ydSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiYjcxM2Q4MDctNTIyOC00NDRmLWIzZjgtNjAzZTA5ZjAzNjVhIn0.VbGKY4LmCdBxw2rgjSQubcsRAZca0xiE0H4OxiY7guLjCHqWbSt13KhUKxR7bvhxHKxY3h2f_Jn4yQnWBSWAuEp-uxvqjlKarWLd--wODVgE-4kz6NN-H5aYGxL2LC6gV3bUi8yKQW4zNsXLtzzRipsk8GyZ8PWzTs-KX4XXrw_1SgK-w1vEGQjJz46-l62jrJ7ZPuSZUzBE5D4yizX0OldVe1jDdey8ZvfSQZqa_bQt8zXAafsBkrSS63lZRc-WiLjPAnyIZBxR0To_nD0b4xPCPsln3EEYfkMNFoPk_GmflvwiJDCeUcuosrg3VEs6vfONkcY1WFkeTo0bZChYzg';

  private get _auth() {
    return `Bearer ${this._token}`;
  }

  private async _getEntities<Entity>(url: string, params?: object) {
    const authorization = this._auth;
    if (!authorization) {
      return;
    }

    return await axios
      .get<AmoGetEntitiesResponse<Entity>>(url, {
        headers: { 'Content-Type': 'application/json', authorization },
        params,
      })
      .then(({ data }) => data);
  }

  private async _getContactsById(id: number[]) {
    const url = `${domain}${paths.contacts}`;

    const params = { filter: { id } };
    const { _embedded } = await this._getEntities<{
      contacts: AmoContact[];
    }>(url, params);

    return _embedded.contacts;
  }

  private async _getPipelines() {
    const url = `${domain}${paths.pipelines}`;

    const { _embedded } = await this._getEntities<{
      pipelines: AmoPipeline[];
    }>(url);

    return _embedded.pipelines;
  }

  private async _getUsers() {
    const url = `${domain}${paths.users}`;

    const { _embedded } = await this._getEntities<{
      users: AmoUser[];
    }>(url);

    return _embedded.users;
  }

  public getLeads = async (params?: Params): Promise<Lead[]> => {
    try {
      const url = `${domain}${paths.trade}`;
      const { _embedded } = await this._getEntities<{
        leads: (AmoLead & { _embedded: { contacts: any[] } })[];
      }>(url, { ...params, with: 'contacts' });

      const contactsIds =
        _embedded?.leads.reduce(
          (acc, { _embedded }) => [
            ...acc,
            ..._embedded.contacts.map(({ id }) => id),
          ],
          [],
        ) || [];

      const allContacts = await this._getContactsById(contactsIds);
      const pipelines = await this._getPipelines();
      const users = await this._getUsers();
      const statuses = pipelines.reduce<AmoStatus[]>(
        (acc, { _embedded }) => [...acc, ...(_embedded?.statuses || [])],
        [],
      );

      const result =
        _embedded?.leads.map<Lead>((item) => {
          const { id, name, price, created_at } = item;

          const contacts = allContacts
            .filter(({ id }) =>
              item._embedded?.contacts.some((item) => item.id === id),
            )
            .map<
              Lead['contacts'][0]
            >(({ email, id, name, phone }) => ({ email, id, name, phone }));

          const [status] = statuses
            .filter(({ id }) => id === item.status_id)
            .map<
              Lead['status']
            >(({ color, id, name }) => ({ color, id, name }));
          const [user] = users
            .filter(({ id }) => id === item.responsible_user_id)
            .map<Lead['user']>(({ id, name, email }) => ({ id, name, email }));
          return { id, name, price, created_at, contacts, status, user };
        }) || [];

      return result;
    } catch (e) {
      console.log(e);
      throw e;
    }
  };
}
