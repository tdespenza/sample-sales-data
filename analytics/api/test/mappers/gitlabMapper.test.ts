import { mapGitLabIssue, mapGitLabMilestone } from '../../src/mappers/gitlabMapper';

describe('mapGitLabIssue', () => {
  it('maps basic fields', () => {
    const issue = {
      id: 1,
      iid: 2,
      title: 'Test',
      state: 'opened',
      weight: 3,
      labels: ['bug'],
      created_at: '2024-01-01',
    };
    const result = mapGitLabIssue(issue);
    expect(result).toEqual({
      id: '1',
      key: '#2',
      title: 'Test',
      state: 'open',
      points: 3,
      labels: [{ id: '0', name: 'bug' }],
      createdAt: '2024-01-01',
      closedAt: undefined,
    });
  });
});

describe('mapGitLabMilestone', () => {
  it('maps milestone', () => {
    const m = { id: 5, title: 'Sprint', start_date: '2024-01-01', due_date: '2024-01-15' };
    const res = mapGitLabMilestone(m);
    expect(res).toEqual({ id: '5', name: 'Sprint', startDate: '2024-01-01', dueDate: '2024-01-15' });
  });
});
