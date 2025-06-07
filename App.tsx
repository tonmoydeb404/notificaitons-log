// App.tsx
import React, {useEffect, useState} from 'react';
import {Alert, Button, FlatList, StyleSheet, Text, View} from 'react-native';
import NotificationService from './src/services/NotificationService';
import './src/styles/global.css';
import type {NotificationData} from './src/types';

const App: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    initializeService();

    const unsubscribe = NotificationService.addListener(
      (notification: NotificationData) => {
        console.log(notification);

        setNotifications(prev => [notification, ...prev]);
      },
    );

    return () => {
      unsubscribe();
      NotificationService.cleanup();
    };
  }, []);

  const initializeService = async (): Promise<void> => {
    try {
      const permission = await NotificationService.hasPermission();
      setHasPermission(permission);

      if (permission) {
        await NotificationService.startListening();
        setNotifications(NotificationService.getNotifications());
      }
    } catch (error) {
      console.error('Failed to initialize service:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestPermission = async (): Promise<void> => {
    await NotificationService.requestPermission();
    Alert.alert(
      'Permission Required',
      'Please enable notification access for this app in the settings, then restart the app.',
      [{text: 'OK'}],
    );
  };

  const renderNotification = ({item}: {item: NotificationData}) => (
    <View style={styles.notificationItem}>
      <Text style={styles.appName}>{item.appName}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.text}>{item.text}</Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Notification access required</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications ({notifications.length})</Text>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderNotification}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  notificationItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  appName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  text: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
});

export default App;
