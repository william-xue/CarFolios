-- CreateTable
CREATE TABLE "Admin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nickname" TEXT,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mobile" TEXT NOT NULL,
    "password" TEXT,
    "nickname" TEXT,
    "avatar" TEXT,
    "realName" TEXT,
    "idCard" TEXT,
    "authStatus" TEXT NOT NULL DEFAULT 'unverified',
    "balance" REAL NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "initial" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1
);

-- CreateTable
CREATE TABLE "Series" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "brandId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "Series_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Car" (
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
    "highlightDesc" TEXT,
    "color" TEXT,
    "plateCity" TEXT,
    "configs" TEXT,
    "rejectReason" TEXT,
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

-- CreateTable
CREATE TABLE "Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderNo" TEXT NOT NULL,
    "carId" INTEGER NOT NULL,
    "buyerId" INTEGER NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "carTitle" TEXT NOT NULL,
    "carImage" TEXT,
    "carPrice" REAL NOT NULL,
    "depositAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payTime" DATETIME,
    "closeTime" DATETIME,
    "remark" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Upload" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "userId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "paymentNo" TEXT NOT NULL,
    "orderId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "channel" TEXT NOT NULL,
    "clientType" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "channelTradeNo" TEXT,
    "clientIp" TEXT,
    "expireTime" DATETIME NOT NULL,
    "paidAt" DATETIME,
    "closedAt" DATETIME,
    "refundedAt" DATETIME,
    "refundAmount" INTEGER,
    "refundReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "paymentId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "newStatus" TEXT,
    "requestData" TEXT,
    "responseData" TEXT,
    "errorMessage" TEXT,
    "operatorId" INTEGER,
    "clientIp" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentLog_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Region" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "parentId" INTEGER,
    "level" INTEGER NOT NULL,
    "pinyin" TEXT,
    "lat" REAL,
    "lng" REAL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Region_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Region" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Region_Car_Province" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "regionId" INTEGER NOT NULL,
    "carId" INTEGER NOT NULL,
    CONSTRAINT "Region_Car_Province_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Region_Car_City" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "regionId" INTEGER NOT NULL,
    "carId" INTEGER NOT NULL,
    CONSTRAINT "Region_Car_City_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Region_Car_District" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "regionId" INTEGER NOT NULL,
    "carId" INTEGER NOT NULL,
    CONSTRAINT "Region_Car_District_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ArchivedCar" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "originalId" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    "archivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedBy" TEXT NOT NULL DEFAULT 'system'
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "data" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Car_vin_key" ON "Car"("vin");

-- CreateIndex
CREATE INDEX "Car_provinceId_idx" ON "Car"("provinceId");

-- CreateIndex
CREATE INDEX "Car_cityId_idx" ON "Car"("cityId");

-- CreateIndex
CREATE INDEX "Car_districtId_idx" ON "Car"("districtId");

-- CreateIndex
CREATE INDEX "Car_vin_idx" ON "Car"("vin");

-- CreateIndex
CREATE INDEX "Car_plateNumber_idx" ON "Car"("plateNumber");

-- CreateIndex
CREATE INDEX "Car_expiresAt_idx" ON "Car"("expiresAt");

-- CreateIndex
CREATE INDEX "Car_status_expiresAt_idx" ON "Car"("status", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNo_key" ON "Order"("orderNo");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentNo_key" ON "Payment"("paymentNo");

-- CreateIndex
CREATE INDEX "Region_parentId_idx" ON "Region"("parentId");

-- CreateIndex
CREATE INDEX "Region_level_idx" ON "Region"("level");

-- CreateIndex
CREATE INDEX "Region_pinyin_idx" ON "Region"("pinyin");

-- CreateIndex
CREATE UNIQUE INDEX "Region_Car_Province_regionId_carId_key" ON "Region_Car_Province"("regionId", "carId");

-- CreateIndex
CREATE UNIQUE INDEX "Region_Car_City_regionId_carId_key" ON "Region_Car_City"("regionId", "carId");

-- CreateIndex
CREATE UNIQUE INDEX "Region_Car_District_regionId_carId_key" ON "Region_Car_District"("regionId", "carId");

-- CreateIndex
CREATE UNIQUE INDEX "ArchivedCar_originalId_key" ON "ArchivedCar"("originalId");

-- CreateIndex
CREATE INDEX "ArchivedCar_originalId_idx" ON "ArchivedCar"("originalId");

-- CreateIndex
CREATE INDEX "ArchivedCar_archivedAt_idx" ON "ArchivedCar"("archivedAt");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");
