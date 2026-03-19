-- CreateTable
CREATE TABLE "ClearanceCertificate" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClearanceCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClearanceCertificate_requestId_key" ON "ClearanceCertificate"("requestId");

-- AddForeignKey
ALTER TABLE "ClearanceCertificate" ADD CONSTRAINT "ClearanceCertificate_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClearanceCertificate" ADD CONSTRAINT "ClearanceCertificate_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ClearanceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
