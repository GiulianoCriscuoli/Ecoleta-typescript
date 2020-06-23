import knex from 'knex';
import path from 'path';

const connection = knex({

    client: 'sqlite3',
    connection: {

        filename: path.resolve(__dirname, 'database.sqlite'),  // une caminhos, padronizando o caminho.
    },
});

export default connection;