'use client'
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  step: {
    marginBottom: 30,
    borderBottom: 1,
    paddingBottom: 10,
  },
  stepHeader: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 12,
    marginBottom: 10,
  },
  image: {
    width: 200,
    height: 200,
    objectFit: 'contain',
    marginBottom: 10,
  },
  separator: {
    borderBottom: 1,
    borderColor: '#CCCCCC',
    marginVertical: 20,
  }
})

export const AssemblyPDF = ({ steps, modelName }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Assembly Instructions: {modelName}</Text>
      {steps.map((step) => (
        <View key={step.id} style={styles.step}>
          <Text style={styles.stepHeader}>Step {step.partNumber}</Text>
          <Text style={styles.description}>{step.description}</Text>
          {step.screenshot && (
            <Image src={step.screenshot} style={styles.image} />
          )}
          <View style={styles.separator} />
        </View>
      ))}
    </Page>
  </Document>
)