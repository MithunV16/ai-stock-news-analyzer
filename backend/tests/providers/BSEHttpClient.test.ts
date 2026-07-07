import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BSEHttpClient } from '@/providers/bse/BSEHttpClient';

vi.mock('axios', () => ({
  default: {
    create: vi.fn(),
  },
}));

describe('BSEHttpClient', () => {
  const get = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(axios.create).mockReturnValue({ get } as never);
  });

  it('GETs the endpoint with no query parameters and parses a JSON array', async () => {
    get.mockResolvedValue({
      status: 200,
      data: [{ Subject: 'Test announcement', Newsid: '1' }],
    });

    const client = new BSEHttpClient();
    const result = await client.fetchAnnouncements();

    expect(get).toHaveBeenCalledWith(
      'https://api.bseindia.com/BseIndiaAPI/api/CorpAnn/w',
    );
    expect(result.rows).toHaveLength(1);
    expect(result.httpStatus).toBe(200);
    expect(result.requestUrl).toBe('https://api.bseindia.com/BseIndiaAPI/api/CorpAnn/w');
  });

  it('throws when the response is not an array', async () => {
    get.mockResolvedValue({
      status: 200,
      data: { Table: [] },
    });

    const client = new BSEHttpClient();
    await expect(client.fetchAnnouncements()).rejects.toThrow('BSE response is not a JSON array');
  });
});
