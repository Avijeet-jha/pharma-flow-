BEGIN;

DELETE FROM "DispatchItem"
WHERE "dispatchId" IN (
    SELECT "id" FROM "Dispatch"
);

DELETE FROM "Dispatch";

COMMIT;