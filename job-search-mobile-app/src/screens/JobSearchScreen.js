import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  ActivityIndicator,
  Searchbar,
  FAB,
  Portal,
  Dialog,
  Text,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  getJobPostings,
  saveJobPosting,
  updateJobPosting,
  deleteJobPosting,
} from '../database/db';
import { analyzeJobPosting } from '../services/claudeService';

const JobSearchScreen = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    description: '',
    url: '',
    provider: 'manual',
    recruiterName: '',
    recruiterEmail: '',
    recruiterPhone: '',
    recruiterLinkedIn: '',
  });

  const loadJobs = async () => {
    setLoading(true);
    try {
      const jobsData = await getJobPostings();
      setJobs(jobsData);
      setFilteredJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
      Alert.alert('Error', 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredJobs(filtered);
    }
  }, [searchQuery, jobs]);

  const handleAddJob = async () => {
    if (!newJob.title || !newJob.company) {
      Alert.alert('Error', 'Please fill in at least the job title and company');
      return;
    }

    try {
      const jobId = await saveJobPosting({
        ...newJob,
        salaryMin: newJob.salaryMin ? parseFloat(newJob.salaryMin) : null,
        salaryMax: newJob.salaryMax ? parseFloat(newJob.salaryMax) : null,
      });

      // Reset form
      setNewJob({
        title: '',
        company: '',
        location: '',
        salaryMin: '',
        salaryMax: '',
        description: '',
        url: '',
        provider: 'manual',
        recruiterName: '',
        recruiterEmail: '',
        recruiterPhone: '',
        recruiterLinkedIn: '',
      });

      setShowAddDialog(false);
      loadJobs();

      // Ask if they want to analyze the job
      Alert.alert(
        'Job Added',
        'Would you like to analyze this job with AI?',
        [
          { text: 'Later', style: 'cancel' },
          {
            text: 'Analyze',
            onPress: () => handleAnalyzeJob(jobId),
          },
        ]
      );
    } catch (error) {
      console.error('Error adding job:', error);
      Alert.alert('Error', 'Failed to add job');
    }
  };

  const handleAnalyzeJob = async (jobId) => {
    setAnalyzing(true);
    try {
      const job = jobs.find((j) => j.id === jobId) || selectedJob;

      const result = await analyzeJobPosting({
        title: job.title,
        company: job.company,
        location: job.location,
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        description: job.description,
      });

      if (result.success) {
        await updateJobPosting(jobId, {
          ai_analysis: JSON.stringify(result.analysis),
          fit_score: result.analysis.fitScore,
        });

        Alert.alert(
          'Analysis Complete',
          `Fit Score: ${result.analysis.fitScore}%\n\n${result.analysis.summary || 'Analysis complete. View job details for full analysis.'}`
        );

        loadJobs();
      } else {
        Alert.alert('Analysis Failed', result.error);
      }
    } catch (error) {
      console.error('Error analyzing job:', error);
      Alert.alert('Error', 'Failed to analyze job. Make sure Claude API key is configured in Settings.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    Alert.alert(
      'Delete Job',
      'Are you sure you want to delete this job posting?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteJobPosting(jobId);
              loadJobs();
              setShowDetailsDialog(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete job');
            }
          },
        },
      ]
    );
  };

  const getFitScoreColor = (score) => {
    if (score >= 80) return '#4bca81';
    if (score >= 60) return '#f39c12';
    return '#e74c3c';
  };

  const JobCard = ({ job }) => {
    const analysis = job.ai_analysis ? JSON.parse(job.ai_analysis) : null;

    return (
      <Card style={styles.jobCard} onPress={() => {
        setSelectedJob(job);
        setShowDetailsDialog(true);
      }}>
        <Card.Content>
          <View style={styles.jobHeader}>
            <View style={styles.jobInfo}>
              <Title style={styles.jobTitle}>{job.title}</Title>
              <Paragraph style={styles.jobCompany}>{job.company}</Paragraph>
              <View style={styles.jobMeta}>
                <Icon name="map-marker" size={14} color="#7f8c8d" />
                <Paragraph style={styles.jobLocation}>{job.location}</Paragraph>
              </View>
              {(job.salary_min || job.salary_max) && (
                <View style={styles.jobMeta}>
                  <Icon name="currency-usd" size={14} color="#7f8c8d" />
                  <Paragraph style={styles.jobSalary}>
                    {job.salary_min ? `$${job.salary_min.toLocaleString()}` : ''}
                    {job.salary_min && job.salary_max ? ' - ' : ''}
                    {job.salary_max ? `$${job.salary_max.toLocaleString()}` : ''}
                  </Paragraph>
                </View>
              )}
            </View>
            {job.fit_score && (
              <Chip
                mode="flat"
                style={[
                  styles.fitChip,
                  { backgroundColor: getFitScoreColor(job.fit_score) },
                ]}
                textStyle={styles.fitChipText}
              >
                {job.fit_score}%
              </Chip>
            )}
          </View>

          {analysis && (
            <View style={styles.analysisPreview}>
              <Paragraph style={styles.analysisSummary} numberOfLines={2}>
                {analysis.summary}
              </Paragraph>
            </View>
          )}

          <View style={styles.jobActions}>
            {!job.ai_analysis && (
              <Button
                mode="outlined"
                icon="brain"
                onPress={() => handleAnalyzeJob(job.id)}
                style={styles.actionButton}
                compact
              >
                Analyze
              </Button>
            )}
            <Button
              mode="contained"
              icon="send"
              onPress={() => navigation.navigate('Applications', { jobId: job.id })}
              style={styles.actionButton}
              compact
            >
              Apply
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search jobs..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {filteredJobs.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="briefcase-search" size={64} color="#bdc3c7" />
              <Title style={styles.emptyTitle}>No Jobs Found</Title>
              <Paragraph style={styles.emptyText}>
                Add a job posting to get started with AI-powered analysis
              </Paragraph>
            </View>
          ) : (
            filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
          )}
        </ScrollView>
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowAddDialog(true)}
      />

      {/* Add Job Dialog */}
      <Portal>
        <Dialog
          visible={showAddDialog}
          onDismiss={() => setShowAddDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Add Job Posting</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              <TextInput
                style={styles.input}
                placeholder="Job Title *"
                value={newJob.title}
                onChangeText={(text) => setNewJob({ ...newJob, title: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Company *"
                value={newJob.company}
                onChangeText={(text) => setNewJob({ ...newJob, company: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Location"
                value={newJob.location}
                onChangeText={(text) => setNewJob({ ...newJob, location: text })}
              />
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Min Salary"
                  keyboardType="numeric"
                  value={newJob.salaryMin}
                  onChangeText={(text) => setNewJob({ ...newJob, salaryMin: text })}
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Max Salary"
                  keyboardType="numeric"
                  value={newJob.salaryMax}
                  onChangeText={(text) => setNewJob({ ...newJob, salaryMax: text })}
                />
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Job Description"
                value={newJob.description}
                onChangeText={(text) => setNewJob({ ...newJob, description: text })}
                multiline
                numberOfLines={4}
              />
              <TextInput
                style={styles.input}
                placeholder="Job URL"
                value={newJob.url}
                onChangeText={(text) => setNewJob({ ...newJob, url: text })}
              />
              <Text style={styles.sectionTitle}>Recruiter Info (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Recruiter Name"
                value={newJob.recruiterName}
                onChangeText={(text) => setNewJob({ ...newJob, recruiterName: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Recruiter Email"
                value={newJob.recruiterEmail}
                onChangeText={(text) => setNewJob({ ...newJob, recruiterEmail: text })}
              />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onPress={handleAddJob}>Add Job</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Job Details Dialog */}
        <Dialog
          visible={showDetailsDialog}
          onDismiss={() => setShowDetailsDialog(false)}
          style={styles.dialog}
        >
          {selectedJob && (
            <>
              <Dialog.Title>{selectedJob.title}</Dialog.Title>
              <Dialog.ScrollArea>
                <ScrollView>
                  <Text style={styles.detailCompany}>{selectedJob.company}</Text>
                  <Text style={styles.detailLocation}>{selectedJob.location}</Text>

                  {selectedJob.ai_analysis && (
                    <View style={styles.analysisSection}>
                      <Text style={styles.analysisTitle}>AI Analysis</Text>
                      {JSON.parse(selectedJob.ai_analysis).summary && (
                        <Text style={styles.analysisText}>
                          {JSON.parse(selectedJob.ai_analysis).summary}
                        </Text>
                      )}
                    </View>
                  )}

                  {selectedJob.description && (
                    <View style={styles.descriptionSection}>
                      <Text style={styles.sectionTitle}>Description</Text>
                      <Text style={styles.descriptionText}>{selectedJob.description}</Text>
                    </View>
                  )}
                </ScrollView>
              </Dialog.ScrollArea>
              <Dialog.Actions>
                <Button onPress={() => handleDeleteJob(selectedJob.id)} textColor="#e74c3c">
                  Delete
                </Button>
                <Button onPress={() => setShowDetailsDialog(false)}>Close</Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    setShowDetailsDialog(false);
                    navigation.navigate('Applications', { jobId: selectedJob.id });
                  }}
                >
                  Apply
                </Button>
              </Dialog.Actions>
            </>
          )}
        </Dialog>
      </Portal>

      {analyzing && (
        <View style={styles.analyzingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.analyzingText}>Analyzing with Claude AI...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  jobCard: {
    marginBottom: 16,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  jobCompany: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  jobLocation: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 4,
  },
  jobSalary: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 4,
  },
  fitChip: {
    height: 32,
    marginLeft: 8,
  },
  fitChipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  analysisPreview: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  analysisSummary: {
    fontSize: 14,
    color: '#2c3e50',
  },
  jobActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#0176d3',
  },
  dialog: {
    maxHeight: '80%',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
    color: '#2c3e50',
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
  analysisSection: {
    backgroundColor: '#e8f4f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#0176d3',
  },
  analysisText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#2c3e50',
  },
  descriptionSection: {
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#2c3e50',
  },
  analyzingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
});

export default JobSearchScreen;
