const express = require("express");
const app = express();
const { graphqlHTTP } = require("express-graphql");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} = require("graphql");
const {books,authors} = require('./data')

const BookType = new GraphQLObjectType({
  name: "Book",
  description: "This represents a book",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLInt) },
    author: {
      type: AuthorType,
      resolve: (book) => {
        return authors.find((author) => author.id === book.authorId);
      },
    },
  }),
});
const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "This represents an author",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      type: new GraphQLList(BookType),
      resolve: (author) => {
        return books.filter((book) => book.authorId === author.id);
      },
    },
  }),
});
const RootQuery = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    book: {
      type: BookType,
      description: "A single book",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => books.find((book) => book.id === args.id),
    },
    books: {
      type: new GraphQLList(BookType),
      description: "List of all books",
      resolve: () => books,
    },
    author: {
      type: AuthorType,
      description: "A single author",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) =>
        authors.find((author) => author.id === args.id),
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: "List of all authors",
      resolve: () => authors,
    },
  }),
});
const RootMutation = new GraphQLObjectType({
  name: "Mutation",
  description: "Adding a book",
  fields: () => ({
    addBook: {
      type: BookType,
      description: "Adding a book through mutation",
      args: {
        name: {
          type: GraphQLNonNull(GraphQLString),
        },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        const book = {id:books.length+1,name:args.name,authorId:args.authorId}
        books.push(book);
        return book
      },
    },
  }),
});
const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);
app.listen(5000, () => {
  console.log(`Server is running`);
});
