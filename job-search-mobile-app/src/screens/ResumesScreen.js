import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  Share,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  Portal,
  Dialog,
  Text,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import {
  getResumes,
  saveResume,
  updateResume,
  getMasterResume,
  getJobPostings,
} from '../database/db';
import { generateResume, generateCoverLetter } from '../services/claudeService';

const ResumesScreen = ({ navigation }) => {
  const [resumes, setResumes] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [newResume, setNewResume] = useState({
    name: '',
    content: '',
    skills: '',
    experience: '',
    education: '',
    certifications: '',
    isMaster: false,
  });

  const loadResumes = async () => {
    try {
      const resumesData = await getResumes();
      setResumes(resumesData);
    } catch (error) {
      console.error('Error loading resumes:', error);
      Alert.alert('Error', 'Failed to load resumes');
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleCreateResume = async () => {
    if (!newResume.name || !newResume.content) {
      Alert.alert('Error', 'Please fill in at least the name and content');
      return;
    }

    try {
      await saveResume(newResume);
      setNewResume({
        name: '',
        content: '',
        skills: '',
        experience: '',
        education: '',
        certifications: '',
        isMaster: false,
      });
      setShowCreateDialog(false);
      loadResumes();
      Alert.alert('Success', 'Resume created successfully');
    } catch (error) {
      console.error('Error creating resume:', error);
      Alert.alert('Error', 'Failed to create resume');
    }
  };

  const handleGenerateTailoredResume = async () => {
    try {
      const masterResume = await getMasterResume();
      if (!masterResume) {
        Alert.alert(
          'No Master Resume',
          'Please create a master resume first by checking "Set as Master Resume" when creating a resume.'
        );
        return;
      }

      const jobs = await getJobPostings();
      if (jobs.length === 0) {
        Alert.alert(
          'No Jobs',
          'Please add some job postings first to generate tailored resumes.'
        );
        return;
      }

      // Show job selection dialog
      Alert.alert(
        'Select Job',
        'Choose a job posting to tailor your resume for:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Generate for Latest',
            onPress: () => generateForJob(jobs[0], masterResume),
          },
        ]
      );
    } catch (error) {
      console.error('Error generating tailored resume:', error);
      Alert.alert('Error', 'Failed to generate tailored resume');
    }
  };

  const generateForJob = async (job, masterResume) => {
    setGenerating(true);
    try {
      const result = await generateResume(
        {
          title: job.title,
          company: job.company,
          description: job.description,
        },
        masterResume
      );

      if (result.success) {
        await saveResume({
          name: `${job.company} - ${job.title}`,
          content: result.tailoredResume,
          skills: masterResume.skills,
          experience: masterResume.experience,
          education: masterResume.education,
          certifications: masterResume.certifications,
          isMaster: false,
        });

        loadResumes();
        Alert.alert(
          'Success',
          'Tailored resume generated successfully!\n\nCover letter and interview tips have also been generated.',
          [
            {
              text: 'View Resume',
              onPress: () => {
                const newResume = resumes[0]; // Will be the most recent
                setSelectedResume(newResume);
                setShowDetailsDialog(true);
              },
            },
            { text: 'OK' },
          ]
        );
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('Error generating resume:', error);
      Alert.alert('Error', 'Failed to generate tailored resume. Make sure Claude API key is configured in Settings.');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportPDF = async (resume) => {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Helvetica', 'Arial', sans-serif;
              padding: 40px;
              color: #2c3e50;
            }
            h1 {
              color: #0176d3;
              border-bottom: 2px solid #0176d3;
              padding-bottom: 10px;
            }
            h2 {
              color: #16325c;
              margin-top: 20px;
            }
            .section {
              margin-bottom: 20px;
            }
            .content {
              white-space: pre-wrap;
              line-height: 1.6;
            }
          </style>
        </head>
        <body>
          <h1>${resume.name}</h1>
          <div class="section">
            <div class="content">${resume.content}</div>
          </div>
          ${resume.skills ? `
            <div class="section">
              <h2>Skills</h2>
              <div class="content">${resume.skills}</div>
            </div>
          ` : ''}
          ${resume.experience ? `
            <div class="section">
              <h2>Experience</h2>
              <div class="content">${resume.experience}</div>
            </div>
          ` : ''}
          ${resume.education ? `
            <div class="section">
              <h2>Education</h2>
              <div class="content">${resume.education}</div>
            </div>
          ` : ''}
          ${resume.certifications ? `
            <div class="section">
              <h2>Certifications</h2>
              <div class="content">${resume.certifications}</div>
            </div>
          ` : ''}
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Share ${resume.name}`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Success', `Resume saved to: ${uri}`);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      Alert.alert('Error', 'Failed to export PDF');
    }
  };

  const ResumeCard = ({ resume }) => {
    return (
      <Card
        style={styles.resumeCard}
        onPress={() => {
          setSelectedResume(resume);
          setShowDetailsDialog(true);
        }}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardInfo}>
              <Title style={styles.cardTitle}>{resume.name}</Title>
              <Paragraph style={styles.cardDate}>
                Created: {new Date(resume.created_at).toLocaleDateString()}
              </Paragraph>
            </View>
            {resume.is_master === 1 && (
              <Chip icon="star" style={styles.masterChip} textStyle={styles.masterChipText}>
                Master
              </Chip>
            )}
          </View>
          <View style={styles.cardActions}>
            <Button
              mode="outlined"
              icon="file-pdf-box"
              onPress={() => handleExportPDF(resume)}
              style={styles.cardButton}
              compact
            >
              Export PDF
            </Button>
            <Button
              mode="outlined"
              icon="share"
              onPress={() => handleExportPDF(resume)}
              style={styles.cardButton}
              compact
            >
              Share
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {resumes.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="file-document-outline" size={64} color="#bdc3c7" />
            <Title style={styles.emptyTitle}>No Resumes Yet</Title>
            <Paragraph style={styles.emptyText}>
              Create a master resume or generate tailored resumes for specific jobs
            </Paragraph>
          </View>
        ) : (
          resumes.map((resume) => <ResumeCard key={resume.id} resume={resume} />)
        )}
      </ScrollView>

      <FAB.Group
        open={false}
        icon="plus"
        actions={[
          {
            icon: 'file-document-edit',
            label: 'Create Resume',
            onPress: () => setShowCreateDialog(true),
          },
          {
            icon: 'brain',
            label: 'AI Generate',
            onPress: handleGenerateTailoredResume,
          },
        ]}
        onStateChange={() => {}}
        onPress={() => setShowCreateDialog(true)}
        style={styles.fab}
      />

      {/* Create Resume Dialog */}
      <Portal>
        <Dialog
          visible={showCreateDialog}
          onDismiss={() => setShowCreateDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Create Resume</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              <TextInput
                style={styles.input}
                placeholder="Resume Name *"
                value={newResume.name}
                onChangeText={(text) => setNewResume({ ...newResume, name: text })}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Resume Content *"
                value={newResume.content}
                onChangeText={(text) => setNewResume({ ...newResume, content: text })}
                multiline
                numberOfLines={6}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Skills (comma-separated)"
                value={newResume.skills}
                onChangeText={(text) => setNewResume({ ...newResume, skills: text })}
                multiline
                numberOfLines={3}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Experience"
                value={newResume.experience}
                onChangeText={(text) => setNewResume({ ...newResume, experience: text })}
                multiline
                numberOfLines={4}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Education"
                value={newResume.education}
                onChangeText={(text) => setNewResume({ ...newResume, education: text })}
                multiline
                numberOfLines={3}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Certifications"
                value={newResume.certifications}
                onChangeText={(text) =>
                  setNewResume({ ...newResume, certifications: text })
                }
                multiline
                numberOfLines={2}
              />
              <View style={styles.checkboxContainer}>
                <Button
                  mode={newResume.isMaster ? 'contained' : 'outlined'}
                  onPress={() =>
                    setNewResume({ ...newResume, isMaster: !newResume.isMaster })
                  }
                  icon="star"
                >
                  Set as Master Resume
                </Button>
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onPress={handleCreateResume}>Create</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Resume Details Dialog */}
        <Dialog
          visible={showDetailsDialog}
          onDismiss={() => setShowDetailsDialog(false)}
          style={styles.dialog}
        >
          {selectedResume && (
            <>
              <Dialog.Title>{selectedResume.name}</Dialog.Title>
              <Dialog.ScrollArea>
                <ScrollView>
                  {selectedResume.is_master === 1 && (
                    <Chip icon="star" style={styles.masterBadge} textStyle={styles.masterBadgeText}>
                      Master Resume
                    </Chip>
                  )}

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Content</Text>
                    <Text style={styles.detailText}>{selectedResume.content}</Text>
                  </View>

                  {selectedResume.skills && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Skills</Text>
                      <Text style={styles.detailText}>{selectedResume.skills}</Text>
                    </View>
                  )}

                  {selectedResume.experience && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Experience</Text>
                      <Text style={styles.detailText}>{selectedResume.experience}</Text>
                    </View>
                  )}

                  {selectedResume.education && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Education</Text>
                      <Text style={styles.detailText}>{selectedResume.education}</Text>
                    </View>
                  )}

                  {selectedResume.certifications && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Certifications</Text>
                      <Text style={styles.detailText}>{selectedResume.certifications}</Text>
                    </View>
                  )}
                </ScrollView>
              </Dialog.ScrollArea>
              <Dialog.Actions>
                <Button onPress={() => handleExportPDF(selectedResume)} icon="file-pdf-box">
                  Export PDF
                </Button>
                <Button onPress={() => setShowDetailsDialog(false)}>Close</Button>
              </Dialog.Actions>
            </>
          )}
        </Dialog>
      </Portal>

      {generating && (
        <View style={styles.generatingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.generatingText}>Generating tailored resume with AI...</Text>
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
  resumeCard: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  masterChip: {
    backgroundColor: '#f39c12',
  },
  masterChipText: {
    color: '#fff',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cardButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  checkboxContainer: {
    marginVertical: 8,
  },
  masterBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f39c12',
    marginBottom: 16,
  },
  masterBadgeText: {
    color: '#fff',
  },
  detailSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  detailText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#2c3e50',
  },
  generatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generatingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
});

export default ResumesScreen;
