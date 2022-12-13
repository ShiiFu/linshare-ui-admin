import api from '@/api';
import RemoteServer from '@/modules/remote-server/types/RemoteServer';
import Domain from '@/modules/domain/types/Domain';

async function listRemoteServers(): Promise<RemoteServer[]> {
  return await api.get('remote_servers');
}

async function createRemoteServer(payload: Omit<RemoteServer, 'uuid'>): Promise<RemoteServer> {
  return await api.post('remote_servers', payload);
}

async function updateRemoteServer(payload: RemoteServer): Promise<RemoteServer> {
  return await api.put(`remote_servers/${payload.uuid}`, payload);
}

async function getAssociatedDomains(uuid: string): Promise<Domain[]> {
  return await api.get(`remote_servers/${uuid}/domains`);
}

async function deleteRemoteServer(uuid: string): Promise<void> {
  return await api.delete(`remote_servers/${uuid}`);
}

export { listRemoteServers, createRemoteServer, updateRemoteServer, getAssociatedDomains, deleteRemoteServer };
