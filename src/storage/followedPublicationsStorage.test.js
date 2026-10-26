const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getFollowedPublications,
  toggleFollowPublication,
} = require('./followedPublicationsStorage');

test('gets empty followed publications for a new user', async () => {
  const items = await getFollowedPublications('user@example.com');
  assert.deepEqual(items, []);
});

test('toggles follow state for a publication', async () => {
  const publicationId = 123;
  const before = await toggleFollowPublication('user@example.com', publicationId);
  const after = await toggleFollowPublication('user@example.com', publicationId);

  assert.equal(before, true);
  assert.equal(after, false);
});
