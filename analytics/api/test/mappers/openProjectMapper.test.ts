import { mapOpenProjectWorkPackage, mapOpenProjectVersion } from '../../src/mappers/openProjectMapper';

describe('mapOpenProjectWorkPackage', () => {
  it('maps fields', () => {
    const wp: any = {
      id: 10,
      subject: 'WP',
      _links: { status: { title: 'Closed' } },
      storyPoints: 5,
      createdAt: '2024-01-01',
      closedAt: '2024-01-02',
    };
    const res = mapOpenProjectWorkPackage(wp);
    expect(res.state).toBe('done');
    expect(res.id).toBe('10');
    expect(res.points).toBe(5);
  });
});

describe('mapOpenProjectVersion', () => {
  it('maps version', () => {
    const v: any = { id: 1, name: 'V1', startDate: '2024-01-01', dueDate: '2024-01-10' };
    const res = mapOpenProjectVersion(v);
    expect(res).toEqual({ id: '1', name: 'V1', startDate: '2024-01-01', dueDate: '2024-01-10' });
  });
});
