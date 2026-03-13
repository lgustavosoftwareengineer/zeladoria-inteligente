import type { ArgumentsHost } from '@nestjs/common';

export function buildMockArgumentsHost(overrides?: {
  statusMock?: jest.Mock;
  jsonMock?: jest.Mock;
}): {
  host: ArgumentsHost;
  statusMock: jest.Mock;
  jsonMock: jest.Mock;
} {
  const jsonMock = overrides?.jsonMock ?? jest.fn();
  const statusMock =
    overrides?.statusMock ?? jest.fn().mockReturnValue({ json: jsonMock });
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status: statusMock }),
      getRequest: () => ({ method: 'POST', url: '/api/reports' }),
    }),
  } as ArgumentsHost;
  return { host, statusMock, jsonMock };
}
