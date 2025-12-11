-- CreateTable
CREATE TABLE "Favorite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "carId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Favorite_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "carId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" INTEGER,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Car" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'personal',
    "brandId" INTEGER NOT NULL,
    "seriesId" INTEGER NOT NULL,
    "firstRegDate" TEXT NOT NULL,
    "mileage" REAL NOT NULL,
    "displacement" REAL,
    "gearbox" TEXT,
    "emissionStandard" TEXT,
    "useType" TEXT,
    "transferCount" INTEGER NOT NULL DEFAULT 0,
    "provinceId" INTEGER,
    "provinceName" TEXT,
    "cityId" INTEGER,
    "cityCode" TEXT,
    "cityName" TEXT,
    "districtId" INTEGER,
    "districtName" TEXT,
    "address" TEXT,
    "lat" REAL,
    "lng" REAL,
    "vin" TEXT,
    "plateNumber" TEXT,
    "engineNumber" TEXT,
    "price" REAL NOT NULL,
    "originalPrice" REAL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "coverImage" TEXT,
    "images" TEXT,
    "video" TEXT,
    "videoThumbnail" TEXT,
    "videoDuration" INTEGER,
    "highlightDesc" TEXT,
    "color" TEXT,
    "plateCity" TEXT,
    "configs" TEXT,
    "rejectReason" TEXT,
    "contactPhone" TEXT,
    "usePlatformPhone" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "expiresAt" DATETIME,
    "renewedAt" DATETIME,
    "renewalCount" INTEGER NOT NULL DEFAULT 0,
    "soldAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Car_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Car_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Car_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Car" ("address", "brandId", "cityCode", "cityId", "cityName", "color", "configs", "coverImage", "createdAt", "displacement", "districtId", "districtName", "emissionStandard", "engineNumber", "expiresAt", "firstRegDate", "gearbox", "highlightDesc", "id", "images", "lat", "lng", "mileage", "originalPrice", "ownerId", "plateCity", "plateNumber", "price", "provinceId", "provinceName", "publishedAt", "rejectReason", "renewalCount", "renewedAt", "seriesId", "soldAt", "sourceType", "status", "title", "transferCount", "updatedAt", "useType", "video", "vin") SELECT "address", "brandId", "cityCode", "cityId", "cityName", "color", "configs", "coverImage", "createdAt", "displacement", "districtId", "districtName", "emissionStandard", "engineNumber", "expiresAt", "firstRegDate", "gearbox", "highlightDesc", "id", "images", "lat", "lng", "mileage", "originalPrice", "ownerId", "plateCity", "plateNumber", "price", "provinceId", "provinceName", "publishedAt", "rejectReason", "renewalCount", "renewedAt", "seriesId", "soldAt", "sourceType", "status", "title", "transferCount", "updatedAt", "useType", "video", "vin" FROM "Car";
DROP TABLE "Car";
ALTER TABLE "new_Car" RENAME TO "Car";
CREATE UNIQUE INDEX "Car_vin_key" ON "Car"("vin");
CREATE INDEX "Car_provinceId_idx" ON "Car"("provinceId");
CREATE INDEX "Car_cityId_idx" ON "Car"("cityId");
CREATE INDEX "Car_districtId_idx" ON "Car"("districtId");
CREATE INDEX "Car_vin_idx" ON "Car"("vin");
CREATE INDEX "Car_plateNumber_idx" ON "Car"("plateNumber");
CREATE INDEX "Car_expiresAt_idx" ON "Car"("expiresAt");
CREATE INDEX "Car_status_expiresAt_idx" ON "Car"("status", "expiresAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE INDEX "Favorite_carId_idx" ON "Favorite"("carId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_carId_key" ON "Favorite"("userId", "carId");

-- CreateIndex
CREATE INDEX "Comment_carId_status_idx" ON "Comment"("carId", "status");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");
