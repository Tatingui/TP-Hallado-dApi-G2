import { database } from '../database';
import { Q } from '@nozbe/watermelondb';

export const getLocalClaims = async (isReceived = false) => {
  const collection = database.get('claims');
  return await collection.query(Q.where('is_received', isReceived)).fetch();
};

export const saveClaimsToLocal = async (claimsList, isReceived = false) => {
  const collection = database.get('claims');
  await database.write(async () => {
    for (const item of claimsList) {
      const existing = await collection.query(Q.where('server_id', item.id)).fetch();
      if (existing.length === 0) {
        await collection.create((claim) => {
          claim.serverId = item.id;
          claim.publicationId = item.publicationId;
          claim.publicationTitle = item.publicationTitle;
          claim.publicationType = item.publicationType;
          claim.publicationBarrio = item.publicationBarrio;
          claim.claimantName = item.claimant ? item.claimant.name : '';
          claim.claimantPhone = item.claimant ? item.claimant.phone : '';
          claim.publisherName = item.publisher ? item.publisher.name : '';
          claim.publisherPhone = item.publisher ? item.publisher.phone : '';
          claim.exactAddress = item.exactAddress || '';
          claim.proofMessage = item.proofMessage || '';
          claim.proofImageUrl = item.proofImageUrl || '';
          claim.status = item.status;
          claim.isReceived = isReceived;
          claim.claimDate = item.claimDate ? new Date(item.claimDate).getTime() : Date.now();
          claim.syncStatus = 'synced';
        });
      }
    }
  });
};
