import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Dimensions } from 'react-native';
import { Card, Title, Paragraph, Button, ProgressBar, Chip } from 'react-native-paper';
import { LineChart, BarChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getApplicationStats, getApplications, getJobPostings } from '../database/db';

const DashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [topJobs, setTopJobs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [weeklyData, setWeeklyData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }]
  });

  const loadDashboardData = async () => {
    try {
      const statsData = await getApplicationStats();
      setStats(statsData);

      const applications = await getApplications();
      setRecentApplications(applications.slice(0, 5));

      const jobs = await getJobPostings();
      const topRatedJobs = jobs
        .filter(job => job.fit_score)
        .sort((a, b) => b.fit_score - a.fit_score)
        .slice(0, 5);
      setTopJobs(topRatedJobs);

      // Generate weekly application data
      const today = new Date();
      const weekData = [0, 0, 0, 0, 0, 0, 0];
      applications.forEach(app => {
        if (app.applied_date) {
          const appDate = new Date(app.applied_date);
          const daysDiff = Math.floor((today - appDate) / (1000 * 60 * 60 * 24));
          if (daysDiff >= 0 && daysDiff < 7) {
            weekData[6 - daysDiff]++;
          }
        }
      });
      setWeeklyData({ ...weeklyData, datasets: [{ data: weekData }] });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      interested: '#3498db',
      applied: '#9b59b6',
      'callback-received': '#f39c12',
      interview: '#e67e22',
      offer: '#2ecc71',
      rejected: '#e74c3c',
      accepted: '#27ae60'
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
      accepted: 'check-circle'
    };
    return icons[status] || 'help-circle';
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="briefcase" size={32} color="#0176d3" />
            <Title style={styles.statNumber}>{stats?.total || 0}</Title>
            <Paragraph style={styles.statLabel}>Total Applications</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="calendar-week" size={32} color="#4bca81" />
            <Title style={styles.statNumber}>{stats?.thisWeek || 0}</Title>
            <Paragraph style={styles.statLabel}>This Week</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="star" size={32} color="#f39c12" />
            <Title style={styles.statNumber}>
              {stats?.avgFitScore ? Math.round(stats.avgFitScore) : 0}%
            </Title>
            <Paragraph style={styles.statLabel}>Avg Fit Score</Paragraph>
          </Card.Content>
        </Card>
      </View>

      {/* Weekly Activity Chart */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Weekly Applications</Title>
          <LineChart
            data={weeklyData}
            width={Dimensions.get('window').width - 60}
            height={200}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(1, 118, 211, ${opacity})`,
              style: {
                borderRadius: 16
              }
            }}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      {/* Application Status Breakdown */}
      {stats?.byStatus && stats.byStatus.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Application Status</Title>
            {stats.byStatus.map((item, index) => (
              <View key={index} style={styles.statusItem}>
                <View style={styles.statusHeader}>
                  <Icon
                    name={getStatusIcon(item.status)}
                    size={20}
                    color={getStatusColor(item.status)}
                  />
                  <Paragraph style={styles.statusLabel}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('-', ' ')}
                  </Paragraph>
                  <Paragraph style={styles.statusCount}>{item.count}</Paragraph>
                </View>
                <ProgressBar
                  progress={item.count / stats.total}
                  color={getStatusColor(item.status)}
                  style={styles.progressBar}
                />
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Top Matched Jobs */}
      {topJobs.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Top Matched Jobs</Title>
            {topJobs.map((job) => (
              <Card key={job.id} style={styles.jobCard}>
                <Card.Content>
                  <View style={styles.jobHeader}>
                    <View style={styles.jobInfo}>
                      <Paragraph style={styles.jobTitle}>{job.title}</Paragraph>
                      <Paragraph style={styles.jobCompany}>{job.company}</Paragraph>
                    </View>
                    <Chip
                      mode="flat"
                      style={[
                        styles.fitChip,
                        { backgroundColor: job.fit_score >= 70 ? '#4bca81' : '#f39c12' }
                      ]}
                      textStyle={styles.fitChipText}
                    >
                      {job.fit_score}% Fit
                    </Chip>
                  </View>
                  <Button
                    mode="outlined"
                    onPress={() => navigation.navigate('Search')}
                    style={styles.viewButton}
                  >
                    View Details
                  </Button>
                </Card.Content>
              </Card>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Recent Applications */}
      {recentApplications.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Recent Applications</Title>
            {recentApplications.map((app) => (
              <Card key={app.id} style={styles.jobCard}>
                <Card.Content>
                  <Paragraph style={styles.jobTitle}>{app.title}</Paragraph>
                  <Paragraph style={styles.jobCompany}>{app.company}</Paragraph>
                  <View style={styles.appFooter}>
                    <Chip
                      icon={() => (
                        <Icon
                          name={getStatusIcon(app.status)}
                          size={16}
                          color="#fff"
                        />
                      )}
                      style={[
                        styles.statusChip,
                        { backgroundColor: getStatusColor(app.status) }
                      ]}
                      textStyle={styles.statusChipText}
                    >
                      {app.status}
                    </Chip>
                    <Paragraph style={styles.appDate}>
                      {new Date(app.created_at).toLocaleDateString()}
                    </Paragraph>
                  </View>
                </Card.Content>
              </Card>
            ))}
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Applications')}
              style={styles.viewAllButton}
            >
              View All Applications
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Quick Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Quick Actions</Title>
          <View style={styles.actionsContainer}>
            <Button
              mode="contained"
              icon="briefcase-search"
              onPress={() => navigation.navigate('Search')}
              style={styles.actionButton}
            >
              Find Jobs
            </Button>
            <Button
              mode="contained"
              icon="file-document-edit"
              onPress={() => navigation.navigate('Resumes')}
              style={[styles.actionButton, { backgroundColor: '#4bca81' }]}
            >
              Create Resume
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 0,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  card: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statusItem: {
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  statusCount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  jobCard: {
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  jobCompany: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  fitChip: {
    height: 28,
  },
  fitChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewButton: {
    marginTop: 8,
  },
  appFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statusChip: {
    height: 24,
  },
  statusChipText: {
    color: '#fff',
    fontSize: 11,
  },
  appDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  viewAllButton: {
    marginTop: 16,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
});

export default DashboardScreen;
