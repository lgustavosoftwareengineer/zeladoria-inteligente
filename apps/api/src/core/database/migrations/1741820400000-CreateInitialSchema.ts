import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialSchema1741820400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "reports" (
        "id"                uuid         NOT NULL DEFAULT gen_random_uuid(),
        "title"             varchar(255) NOT NULL,
        "description"       text         NOT NULL,
        "location"          varchar(500) NOT NULL,
        "category"          varchar(100) NOT NULL,
        "priority"          varchar(50)  NOT NULL,
        "technical_summary" text         NOT NULL,
        "created_at"        timestamptz  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reports" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id"           uuid         NOT NULL DEFAULT gen_random_uuid(),
        "report_id"    uuid         NOT NULL,
        "event_type"   varchar(50)  NOT NULL,
        "provider"     varchar(100) NOT NULL,
        "model"        varchar(150) NOT NULL,
        "prompt_sent"  text         NOT NULL,
        "raw_response" text,
        "error_message" text,
        "latency_ms"   integer,
        "created_at"   timestamptz  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_audit_logs_report_id"
      ON "audit_logs" ("report_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_report_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "reports"`);
  }
}
