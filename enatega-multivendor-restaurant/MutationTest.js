import React from 'react'
import { Text, Button, View } from 'react-native'
import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

const TEST_MUTATION = gql`
  mutation test {
    __typename
  }
`

export default function TestMutation() {
  const [test] = useMutation(TEST_MUTATION)
  return (
    <View>
      <Button title="Test" onPress={() => test()} />
      <Text>OK</Text>
    </View>
  )
}
