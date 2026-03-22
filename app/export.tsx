import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useTrips } from "@/contexts/TripContext";
import { useTheme } from "@/contexts/ThemeContext";
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, FileText, CheckCircle2, Share2 } from 'lucide-react-native';
import { useRouter } from "expo-router";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { formatCurrency } from '@/utils/helpers';

export default function Export() {
  const { trips } = useTrips();
  const { colors } = useTheme();
  const router = useRouter();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedTrip = trips.find(t => t.id === selectedTripId);

  const generatePDF = async () => {
    if (!selectedTrip) {
      Alert.alert("Select a Trip", "Please select a trip to generate PDF.");
      return;
    }

    setIsGenerating(true);
    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
              h1 { color: #0F7B6C; margin-bottom: 5px; }
              .header { border-bottom: 2px solid #0F7B6C; padding-bottom: 20px; margin-bottom: 30px; }
              .meta { font-size: 14px; color: #666; margin-bottom: 5px; }
              .section { margin-bottom: 25px; }
              .section-title { font-size: 18px; font-weight: bold; color: #0F7B6C; border-left: 4px solid #0F7B6C; padding-left: 10px; margin-bottom: 15px; }
              .day-card { border: 1px solid #eee; border-radius: 8px; padding: 15px; margin-bottom: 10px; background-color: #f9f9f9; }
              .day-title { font-weight: bold; margin-bottom: 10px; display: block; }
              .item { margin-bottom: 8px; font-size: 14px; }
              .time { font-weight: bold; color: #666; width: 80px; display: inline-block; }
              .expense-table { width: 100%; border-collapse: collapse; }
              .expense-table th, .expense-table td { text-align: left; padding: 10px; border-bottom: 1px solid #eee; }
              .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; color: #0F7B6C; }
              .note { background: #FFF0EB; padding: 10px; border-radius: 4px; border-left: 3px solid #E8734A; margin-bottom: 10px; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${selectedTrip.title}</h1>
              <div class="meta">📍 ${selectedTrip.destination}, ${selectedTrip.country}</div>
              <div class="meta">📅 ${new Date(selectedTrip.startDate).toLocaleDateString()} - ${new Date(selectedTrip.endDate).toLocaleDateString()}</div>
              <div class="meta">💰 Budget: ₹${selectedTrip.budget}</div>
            </div>

            <div class="section">
              <div class="section-title">Itinerary</div>
              ${selectedTrip.itinerary.map((day: any, i: number) => `
                <div class="day-card">
                  <span class="day-title">Day ${i + 1} - ${new Date(day.date).toLocaleDateString()}</span>
                  ${day.items.map((item: any) => `
                    <div class="item">
                      <span class="time">${item.time}</span>
                      <span>${item.title}: ${item.description}</span>
                    </div>
                  `).join('')}
                </div>
              `).join('')}
            </div>

            ${selectedTrip.expenses.length > 0 ? `
              <div class="section">
                <div class="section-title">Expenses</div>
                <table class="expense-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${selectedTrip.expenses.map((e: any) => `
                      <tr>
                        <td>${e.category || 'Other'}</td>
                        <td>₹${e.amount}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                <div class="total">Total Spent: ₹${selectedTrip.expenses.reduce((s: number, e: any) => s + e.amount, 0)}</div>
              </div>
            ` : ''}

            ${selectedTrip.notes.length > 0 ? `
              <div class="section">
                <div class="section-title">Notes</div>
                ${selectedTrip.notes.map((n: any) => `<div class="note">${n.content}</div>`).join('')}
              </div>
            ` : ''}
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Export Trip Data</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.instruction, { color: colors.textSecondary }]}>
          Select a trip to generate a detailed PDF report including your itinerary, expenses, and notes.
        </Text>

        <View style={styles.tripGrid}>
          {trips.map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={[
                styles.tripCard,
                { backgroundColor: colors.card, borderColor: selectedTripId === trip.id ? colors.primary : colors.border }
              ]}
              onPress={() => setSelectedTripId(trip.id)}
              activeOpacity={0.7}
            >
              <View style={styles.tripCardHeader}>
                <FileText size={20} color={selectedTripId === trip.id ? colors.primary : colors.textSecondary} />
                {selectedTripId === trip.id && <CheckCircle2 size={18} color={colors.primary} />}
              </View>
              <Text style={[styles.tripTitle, { color: colors.text }]} numberOfLines={1}>{trip.title}</Text>
              <Text style={[styles.tripDate, { color: colors.textLight }]}>{new Date(trip.startDate).toLocaleDateString()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {trips.length === 0 && (
          <View style={styles.emptyState}>
            <FileText size={48} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No trips found to export.</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.generateBtn,
            { backgroundColor: selectedTripId ? colors.primary : colors.border, opacity: isGenerating ? 0.7 : 1 }
          ]}
          onPress={generatePDF}
          disabled={!selectedTripId || isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Share2 size={18} color={colors.white} />
              <Text style={styles.generateBtnText}>Generate PDF</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: {
    marginRight: 15,
  },
  title: { fontSize: 22, fontWeight: "bold" },
  content: { padding: 20 },
  instruction: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  tripGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tripCard: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tripTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  tripDate: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  generateBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: "700",
  }
});
