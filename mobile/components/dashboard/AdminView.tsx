import React from 'react';
import { View, Text } from 'react-native';

export default function AdminView() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Admin Control Panel</Text>
      <Text>System Overview & User Management</Text>
    </View>
  );
}