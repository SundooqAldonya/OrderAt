const { GraphQLScalarType, Kind } = require('graphql')

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Custom Date scalar type',
  parseValue(value) {
    return new Date(value) // client -> server
  },
  serialize(value) {
    return value instanceof Date ? value.toISOString() : null // server -> client
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value)
    }
    return null
  }
})

module.exports = {
  Date: dateScalar
}
