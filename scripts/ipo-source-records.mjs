/** Same whole-record replacement and issuer identities as getAllIpos in ipoStore.ts. */
export function mergeIpoSourceRecords(base, custom) {
  const records = [];
  for (const item of [...base, ...custom]) {
    const index = records.findIndex(existing => existing.id === item.id
      || Boolean(existing.code && item.code && existing.code === item.code)
      || Boolean(existing.discovery?.corpCode && existing.discovery.corpCode === item.discovery?.corpCode));
    if (index < 0) records.push(item);
    else records[index] = item;
  }
  return records;
}
