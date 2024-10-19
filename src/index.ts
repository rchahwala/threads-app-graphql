import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { prismaClient } from './lib/db';

type User = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

const init = async () => {
    const app = express();

    const PORT = Number(process.env.PORT) || 8000;

    //handle json
    app.use(express.json());

    // create graph server
    const gqlServer = new ApolloServer({
        typeDefs: `
            type Query {
                hello: String,
                getName(name: String): String,
                getLastName(lastName:String): String
            }
            type Mutation {
                createUser(firstName: String!, lastName: String!, email: String!, password: String!): Boolean
            }
        `, // Schema
        resolvers: {
            Query: {
                hello: () => 'Hello I am graphql Server',
                getName: (_, { name }: { name: String }) => `Hi ${name}!`,
                getLastName: (_, { lastName }: { lastName: String }) =>
                    `Hi ${lastName}!`,
            },
            Mutation: {
                createUser: async (
                    _,
                    { firstName, lastName, email, password }: User
                ) => {
                    await prismaClient.user.create({
                        data: {
                            email,
                            firstName,
                            lastName,
                            password,
                            salt: 'random_salt',
                        },
                    });
                    return true;
                },
            },
        }, //
    });

    await gqlServer.start();

    app.get('/', (req, res) => {
        res.json({ message: 'Server is up and running!' });
    });

    app.use('/graphql', expressMiddleware(gqlServer));

    app.listen(PORT, () => console.log(`Server started at PORT:${PORT}`));
};

init();
