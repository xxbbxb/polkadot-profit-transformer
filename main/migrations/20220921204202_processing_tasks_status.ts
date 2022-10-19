import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TYPE processing_status ADD value 'cancelled'`);
}


export async function down(knex: Knex): Promise<void> {
}

