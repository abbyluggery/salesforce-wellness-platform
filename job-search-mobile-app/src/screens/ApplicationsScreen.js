import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  FAB,
  Portal,
  Dialog,
  Text,
  SegmentedButtons,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getApplications, createApplication, updateApplication } from '../database/db';
import { format } from 'date-fns';

const ApplicationsScreen = ({ route, navigation }) => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'interested', label: 'Interested' },
    { value: 'applied', label: 'Applied' },
    { value: 'callback-received', label: 'Callback' },
    { value: 'interview', label: 'Interview' },
    { value: 'offer', label: 'Offer' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'accepted', label: 'Accepted' },
  ];

  const loadApplications = async () => {
    try {
      const appsData = await getApplications();
      setApplications(appsData);
      filterApplications(appsData, selectedStatus);
    } catch (error) {
      console.error('Error loading applications:', error);
      Alert.alert('Error', 'Failed to load applications');
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterApplications(applications, selectedStatus);
  }, [selectedStatus]);

  const filterApplications = (apps, status) => {
    if (status === 'all') {
      setFilteredApplications(apps);
    } else {
      setFilteredApplications(apps.filter((app) => app.status === status));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      interested: '#3498db',
      applied: '#9b59b6',
      'callback-received': '#f39c12',
      interview: '#e67e22',
      offer: '#2ecc71',
      rejected: '#e74c3c',
      accepted: '#27ae60',
    };
    return colors[status] || '#95a5a6';
  };

  const getStatusIcon = (status) => {
    const icons = {
      interested: 'eye-outline',
      applied: 'send',
      'callback-received': 'phone-incoming',
      interview: 'account-tie',
      offer: 'gift',
      rejected: 'close-circle',
      accepted: 'check-circle',
    };
    return icons[status] || 'help-circle';
  };

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      const updateData = { status: newStatus };

      // Add date fields based on status
      if (newStatus === 'applied' && !selectedApp.applied_date) {
        updateData.applied_date = new Date().toISOString().split('T')[0];
      } else if (newStatus === 'callback-received' && !selectedApp.callback_date) {
        updateData.callback_date = new Date().toISOString().split('T')[0];
      } else if (newStatus === 'interview' && !selectedApp.interview_date) {
        updateData.interview_date = new Date().toISOString().split('T')[0];
      }

      await updateApplication(appId, updateData);
      loadApplications();
      setShowDetailsDialog(false);
      Alert.alert('Success', 'Application status updated');
    } catch (error) {
      console.error('Error updating application:', error);
      Alert.alert('Error', 'Failed to update application status');
    }
  };

  const ApplicationCard = ({ app }) => {
    const statusColor = getStatusColor(app.status);
    const statusIcon = getStatusIcon(app.status);

    return (
      <Card
        style={styles.appCard}
        onPress={() => {
          setSelectedApp(app);
          setShowDetailsDialog(true);
        }}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardInfo}>
              <Title style={styles.cardTitle}>{app.title}</Title>
              <Paragraph style={styles.cardCompany}>{app.company}</Paragraph>
              <View style={styles.cardMeta}>
                <Icon name="map-marker" size={14} color="#7f8c8d" />
                <Paragraph style={styles.cardLocation}>{app.location}</Paragraph>
              </View>
            </View>
            <Chip
              icon={() => <Icon name={statusIcon} size={16} color="#fff" />}
              style={[styles.statusChip, { backgroundColor: statusColor }]}
              textStyle={styles.statusChipText}
            >
              {app.status}
            </Chip>
          </View>

          {app.applied_date && (
            <View style={styles.dateInfo}>
              <Icon name="calendar" size={16} color="#7f8c8d" />
              <Text style={styles.dateText}>
                Applied: {format(new Date(app.applied_date), 'MMM dd, yyyy')}
              </Text>
            </View>
          )}

          {app.notes && (
            <Paragraph style={styles.notes} numberOfLines={2}>
              {app.notes}
            </Paragraph>
          )}
        </Card.Content>
      </Card>
    );
  };

  const StatusUpdateButtons = ({ currentStatus, onStatusChange }) => {
    const nextStatuses = {
      interested: ['applied', 'rejected'],
      applied: ['callback-received', 'rejected'],
      'callback-received': ['interview', 'rejected'],
      interview: ['offer', 'rejected'],
      offer: ['accepted', 'rejected'],
    };

    const possibleStatuses = nextStatuses[currentStatus] || [];

    return (
      <View style={styles.statusButtons}>
        {possibleStatuses.map((status) => (
          <Button
            key={status}
            mode="contained"
            style={[
              styles.statusButton,
              { backgroundColor: getStatusColor(status) },
            ]}
            onPress={() => onStatusChange(status)}
            icon={() => <Icon name={getStatusIcon(status)} size={20} color="#fff" />}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
          </Button>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterChips}>
            {statusOptions.map((option) => (
              <Chip
                key={option.value}
                selected={selectedStatus === option.value}
                onPress={() => setSelectedStatus(option.value)}
                style={[
                  styles.filterChip,
                  selectedStatus === option.value && styles.filterChipSelected,
                ]}
              >
                {option.label}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView}>
        {filteredApplications.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="clipboard-text-outline" size={64} color="#bdc3c7" />
            <Title style={styles.emptyTitle}>No Applications</Title>
            <Paragraph style={styles.emptyText}>
              Start applying to jobs to track your progress
            </Paragraph>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Search')}
              style={styles.emptyButton}
            >
              Find Jobs
            </Button>
          </View>
        ) : (
          filteredApplications.map((app) => (
            <ApplicationCard key={app.id} app={app} />
          ))
        )}
      </ScrollView>

      {/* Application Details Dialog */}
      <Portal>
        <Dialog
          visible={showDetailsDialog}
          onDismiss={() => setShowDetailsDialog(false)}
          style={styles.dialog}
        >
          {selectedApp && (
            <>
              <Dialog.Title>{selectedApp.title}</Dialog.Title>
              <Dialog.ScrollArea>
                <ScrollView>
                  <Text style={styles.detailCompany}>{selectedApp.company}</Text>
                  <Text style={styles.detailLocation}>{selectedApp.location}</Text>

                  <View style={styles.statusSection}>
                    <Text style={styles.sectionTitle}>Current Status</Text>
                    <Chip
                      icon={() => (
                        <Icon
                          name={getStatusIcon(selectedApp.status)}
                          size={18}
                          color="#fff"
                        />
                      )}
                      style={[
                        styles.currentStatusChip,
                        { backgroundColor: getStatusColor(selectedApp.status) },
                      ]}
                      textStyle={styles.currentStatusText}
                    >
                      {selectedApp.status.charAt(0).toUpperCase() +
                        selectedApp.status.slice(1).replace('-', ' ')}
                    </Chip>
                  </View>

                  <View style={styles.timelineSection}>
                    <Text style={styles.sectionTitle}>Timeline</Text>
                    {selectedApp.applied_date && (
                      <View style={styles.timelineItem}>
                        <Icon name="send" size={20} color="#9b59b6" />
                        <Text style={styles.timelineText}>
                          Applied: {format(new Date(selectedApp.applied_date), 'MMM dd, yyyy')}
                        </Text>
                      </View>
                    )}
                    {selectedApp.callback_date && (
                      <View style={styles.timelineItem}>
                        <Icon name="phone-incoming" size={20} color="#f39c12" />
                        <Text style={styles.timelineText}>
                          Callback: {format(new Date(selectedApp.callback_date), 'MMM dd, yyyy')}
                        </Text>
                      </View>
                    )}
                    {selectedApp.interview_date && (
                      <View style={styles.timelineItem}>
                        <Icon name="account-tie" size={20} color="#e67e22" />
                        <Text style={styles.timelineText}>
                          Interview: {format(new Date(selectedApp.interview_date), 'MMM dd, yyyy')}
                        </Text>
                      </View>
                    )}
                  </View>

                  {selectedApp.notes && (
                    <View style={styles.notesSection}>
                      <Text style={styles.sectionTitle}>Notes</Text>
                      <Text style={styles.notesText}>{selectedApp.notes}</Text>
                    </View>
                  )}

                  <Text style={styles.sectionTitle}>Update Status</Text>
                  <StatusUpdateButtons
                    currentStatus={selectedApp.status}
                    onStatusChange={(newStatus) =>
                      handleStatusUpdate(selectedApp.id, newStatus)
                    }
                  />
                </ScrollView>
              </Dialog.ScrollArea>
              <Dialog.Actions>
                <Button onPress={() => setShowDetailsDialog(false)}>Close</Button>
              </Dialog.Actions>
            </>
          )}
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  filterChips: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#f8f9fa',
  },
  filterChipSelected: {
    backgroundColor: '#0176d3',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#7f8c8d',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  emptyButton: {
    marginTop: 16,
  },
  appCard: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  cardCompany: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  cardLocation: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 4,
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    color: '#fff',
    fontSize: 11,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dateText: {
    fontSize: 13,
    color: '#7f8c8d',
    marginLeft: 6,
  },
  notes: {
    marginTop: 8,
    fontSize: 14,
    color: '#2c3e50',
    fontStyle: 'italic',
  },
  dialog: {
    maxHeight: '80%',
  },
  detailCompany: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  detailLocation: {
    fontSize: 14,
    color: '#95a5a6',
    marginBottom: 16,
  },
  statusSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  currentStatusChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
  },
  currentStatusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  timelineSection: {
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineText: {
    fontSize: 14,
    marginLeft: 8,
    color: '#2c3e50',
  },
  notesSection: {
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#2c3e50',
  },
  statusButtons: {
    gap: 8,
    marginBottom: 16,
  },
  statusButton: {
    marginBottom: 8,
  },
});

export default ApplicationsScreen;
