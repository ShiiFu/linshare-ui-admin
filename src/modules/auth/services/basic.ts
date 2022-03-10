import store from '@/core/store';
import { logOut } from './auth-api';
import { dehydrate, hydrate } from '@/core/store/hydrate';
import { AxiosRequestConfig } from 'axios';

export interface LoginCredentials {
  email: string;
  password: string;
  otp?: string;
}

interface AuthRequestConfig extends AxiosRequestConfig {
  headers: {
    'x-linShare-2fa-pin'?: string;
  };
}

export async function login(credentials: LoginCredentials): Promise<void> {
  const params: AuthRequestConfig = {
    auth: {
      username: credentials.email,
      password: credentials.password,
    },
    headers: {},
  };

  if (credentials.otp) {
    params.headers['x-linShare-2fa-pin'] = credentials.otp;
  }
  await store.dispatch('Auth/fetchLoggedUser', params);
  store.commit('setAuthenticated', true);
  await hydrate();
}

export async function logout(): Promise<void> {
  await logOut();
  await dehydrate();
}
