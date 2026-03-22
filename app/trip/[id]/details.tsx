import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    TextInput,
    Alert,
    Dimensions,
    Linking,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
    MapPin, Calendar, IndianRupee, FileText, BarChart3,
    Plus, Trash2, Clock, Car, Bed, UtensilsCrossed, Camera,
    ShoppingBag, Heart, MoreHorizontal, Map
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useSnackbar } from '@/components/Snackbar';
import { useTrips } from '@/contexts/TripContext';
import { formatCurrency, getDaysBetween, getTripSummary, formatDate, getTripStatus, getStatusColor } from '@/utils/helpers';
import { ExpenseCategory } from '@/types/trip';
import { expenseCategoryLabels } from '@/mocks/destinations';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const TAB_ITEMS = ['Itinerary', 'Expenses', 'Notes', 'Summary'];

const categoryIcons: Record<string, React.ReactNode> = {
    transport: <Car size={16} color={Colors.categories.transport} />,
    accommodation: <Bed size={16} color={Colors.categories.accommodation} />,
    food: <UtensilsCrossed size={16} color={Colors.categories.food} />,
    sightseeing: <Camera size={16} color={Colors.categories.sightseeing} />,
    shopping: <ShoppingBag size={16} color={Colors.categories.shopping} />,
    health: <Heart size={16} color={Colors.categories.health} />,
    other: <MoreHorizontal size={16} color={Colors.categories.other} />,
};

const expenseCategories: ExpenseCategory[] = ['transport', 'accommodation', 'food', 'sightseeing', 'shopping', 'health', 'other'];

export default function TripDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { getTripById, addExpense, deleteExpense, addNote, deleteNote, updateTrip, setItinerary } = useTrips();
    const snackbar = useSnackbar();
    const trip = getTripById(id ?? '');

    const [activeTab, setActiveTab] = useState(0);
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [showAddNote, setShowAddNote] = useState(false);
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseDesc, setExpenseDesc] = useState('');
    const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('food');
    const [noteContent, setNoteContent] = useState('');
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const tabAnim = useRef(new Animated.Value(0)).current;
    const mapBtnAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    const handleTabChange = useCallback((index: number) => {
        setActiveTab(index);
        Animated.timing(tabAnim, { toValue: index, duration: 200, useNativeDriver: true }).start();
    }, [tabAnim]);

    const handleAddExpense = useCallback(() => {
        if (!expenseAmount || !expenseDesc || !id) return;
        const parsedAmount = parseFloat(expenseAmount);
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return;
        addExpense(id, { category: expenseCategory, amount: parsedAmount, currency: 'INR', description: expenseDesc, date: new Date().toISOString() });
        setExpenseAmount(''); setExpenseDesc(''); setShowAddExpense(false);
    }, [id, expenseAmount, expenseDesc, expenseCategory, addExpense]);

    const handleAddNote = useCallback(() => {
        if (!noteContent || !id) return; addNote(id, noteContent); setNoteContent(''); setShowAddNote(false);
    }, [id, noteContent, addNote]);

    const handleOpenMap = useCallback(async () => {
        if (!trip?.destination) return;
        const destination = encodeURIComponent(trip.destination);
        // dir without origin naturally opens from "User's Current Location" to destination
        const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
        const searchUrl = `https://www.google.com/maps/search/?api=1&query=${destination}`;

        try {
            const supported = await Linking.canOpenURL(dirUrl);
            if (supported) {
                await Linking.openURL(dirUrl);
            } else {
                // fallback to search if directions URL fails
                const searchSupported = await Linking.canOpenURL(searchUrl);
                if (searchSupported) {
                    await Linking.openURL(searchUrl);
                } else {
                    Alert.alert("Error", "Could not open Google Maps.");
                }
            }
        } catch (error) {
            Alert.alert("Error", "Something went wrong opening the map.");
        }
    }, [trip]);

    const summary = useMemo(() => { if (!trip) return null; return getTripSummary(trip); }, [trip]);

    if (!trip) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ title: 'Trip Not Found', headerTintColor: Colors.text }} />
                <View style={styles.notFound}><Text style={styles.notFoundText}>Trip not found</Text></View>
            </View>
        );
    }

    const totalSpent = trip.expenses.reduce((s: number, e: any) => s + e.amount, 0);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                title: '',
                headerShown: true,
                headerTintColor: Colors.text,
                headerStyle: { backgroundColor: Colors.white },
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15 }}>
                        <Ionicons name="arrow-back" size={28} color="black" />
                    </TouchableOpacity>
                ),
                headerShadowVisible: false,
                headerRight: () => (
                    <Animated.View style={{ transform: [{ scale: mapBtnAnim }] }}>
                        <TouchableOpacity
                            onPress={handleOpenMap}
                            onPressIn={() => Animated.spring(mapBtnAnim, { toValue: 0.85, useNativeDriver: true }).start()}
                            onPressOut={() => Animated.spring(mapBtnAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start()}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={{ marginRight: 15 }}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons name="directions" size={26} color={Colors.primary} />
                        </TouchableOpacity>
                    </Animated.View>
                )
            }} />
            <Animated.ScrollView style={{ opacity: fadeAnim }} showsVerticalScrollIndicator={false}>
                <View style={styles.budgetCard}>
                    <View style={styles.budgetHeader}>
                        <Text style={styles.budgetTitle}>Budget Overview</Text>
                        <View style={styles.statusChip}>
                            <View style={[styles.statusDot, { backgroundColor: getStatusColor(getTripStatus(trip.startDate, trip.endDate)) }]} />
                            <Text style={styles.statusChipText}>{getTripStatus(trip.startDate, trip.endDate)}</Text>
                        </View>
                    </View>
                    <View style={styles.budgetNumbers}>
                        <View>
                            <Text style={styles.budgetSpent}>{formatCurrency(totalSpent)}</Text>
                            <Text style={styles.budgetLabel}>spent</Text>
                        </View>
                        <View style={styles.budgetDivider} />
                        <View>
                            <Text style={styles.budgetTotal}>{formatCurrency(trip.budget)}</Text>
                            <Text style={styles.budgetLabel}>budget</Text>
                        </View>
                        <View style={styles.budgetDivider} />
                        <View>
                            <Text style={[styles.budgetRemaining, { color: trip.budget - totalSpent >= 0 ? Colors.success : Colors.danger }]}>
                                {formatCurrency(Math.abs(trip.budget - totalSpent))}
                            </Text>
                            <Text style={styles.budgetLabel}>{trip.budget - totalSpent >= 0 ? 'remaining' : 'over'}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.tabBar}>
                    {TAB_ITEMS.map((tab, i) => (
                        <TouchableOpacity key={tab} style={[styles.tab, activeTab === i && styles.tabActive]} onPress={() => handleTabChange(i)} activeOpacity={0.7}>
                            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.tabContent}>
                    {activeTab === 0 && (
                        <View>
                            <TouchableOpacity style={styles.addBtn} onPress={() => router.push(`/trip/${trip.id}/add-itinerary`)} activeOpacity={0.8}>
                                <Plus size={18} color={Colors.white} />
                                <Text style={styles.addBtnText}>Add Itinerary</Text>
                            </TouchableOpacity>

                            {trip.itinerary.length === 0 ? (
                                <View style={styles.emptyTab}><Clock size={40} color={Colors.textLight} /><Text style={styles.emptyTabText}>No itinerary yet</Text></View>
                            ) : (
                                trip.itinerary.flatMap((day: any) => (day.items || []).map((item: any) => ({ day, item }))).map(({ day, item }: any) => (
                                    <View key={item.id} style={styles.expenseItem}>
                                        <View style={[styles.expenseIcon, { backgroundColor: Colors.primary + '20' }]}><Clock size={16} color={Colors.categories.transport || Colors.primary} /></View>
                                        <View style={styles.expenseInfo}><Text style={styles.expenseName}>{item.title}</Text><Text style={styles.expenseCat}>{formatDate(day.date)} • {item.time}</Text></View>
                                        <TouchableOpacity onPress={() => router.push(`/trip/${trip.id}/edit-itinerary?itemId=${item.id}&date=${encodeURIComponent(day.date)}`)} style={{ marginRight: 12 }}><Text style={styles.actionText}>Edit</Text></TouchableOpacity>
                                        <TouchableOpacity onPress={() => { Alert.alert('Delete', 'Delete this itinerary item?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { const prev = JSON.parse(JSON.stringify(trip.itinerary || [])); const updated = trip.itinerary.map((d: any) => ({ ...d, items: [...(d.items || [])] })); const di = updated.find((d: any) => d.date && d.date.startsWith(day.date)); if (di) { di.items = di.items.filter((it: any) => it.id !== item.id); } const cleaned = updated.filter((d: any) => (d.items && d.items.length > 0)); setItinerary(trip.id, cleaned); snackbar.show({ message: 'Itinerary deleted', actionLabel: 'Undo', onAction: () => setItinerary(trip.id, prev) }); } }]); }}>
                                            <Trash2 size={18} color={Colors.textLight} />
                                        </TouchableOpacity>
                                    </View>
                                ))
                            )}
                        </View>
                    )}

                    {activeTab === 1 && (
                        <View>
                            <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddExpense(!showAddExpense)} activeOpacity={0.8}><Plus size={18} color={Colors.white} /><Text style={styles.addBtnText}>Add Expense</Text></TouchableOpacity>
                            {showAddExpense && (
                                <View style={styles.addForm}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
                                        {expenseCategories.map(cat => (
                                            <TouchableOpacity key={cat} style={[styles.categoryChip, expenseCategory === cat && styles.categoryChipActive]} onPress={() => setExpenseCategory(cat)}>
                                                {categoryIcons[cat]}
                                                <Text style={[styles.categoryChipText, expenseCategory === cat && styles.categoryChipTextActive]}>{expenseCategoryLabels[cat]}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                    <View style={styles.addFormRow}><TextInput style={[styles.addFormInput, { flex: 1 }]} placeholder="Amount" placeholderTextColor={Colors.textLight} value={expenseAmount} onChangeText={setExpenseAmount} keyboardType="numeric" /><TextInput style={[styles.addFormInput, { flex: 2 }]} placeholder="Description" placeholderTextColor={Colors.textLight} value={expenseDesc} onChangeText={setExpenseDesc} /></View>
                                    <TouchableOpacity style={styles.saveBtn} onPress={handleAddExpense} activeOpacity={0.8}><Text style={styles.saveBtnText}>Save</Text></TouchableOpacity>
                                </View>
                            )}

                            {trip.expenses.length === 0 ? (<View style={styles.emptyTab}><IndianRupee size={32} color={Colors.textLight} /><Text style={styles.emptyTabText}>No expenses logged</Text></View>) : (
                                trip.expenses.map((expense: any) => (
                                    <View key={expense.id} style={styles.expenseItem}><View style={[styles.expenseIcon, { backgroundColor: (Colors.categories[expense.category] || Colors.textLight) + '20' }]}>{categoryIcons[expense.category]}</View><View style={styles.expenseInfo}><Text style={styles.expenseName}>{expense.description}</Text><Text style={styles.expenseCat}>{expenseCategoryLabels[expense.category]} • {formatDate(expense.date)}</Text></View><Text style={styles.expenseAmount}>{formatCurrency(expense.amount)}</Text><TouchableOpacity onPress={() => deleteExpense(trip.id, expense.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}><Trash2 size={14} color={Colors.textLight} /></TouchableOpacity></View>
                                ))
                            )}
                        </View>
                    )}

                    {activeTab === 2 && (
                        <View>
                            <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddNote(!showAddNote)} activeOpacity={0.8}><Plus size={18} color={Colors.white} /><Text style={styles.addBtnText}>Add Note</Text></TouchableOpacity>
                            {showAddNote && (<View style={styles.addForm}><TextInput style={styles.noteInput} placeholder="Write your note..." placeholderTextColor={Colors.textLight} value={noteContent} onChangeText={setNoteContent} multiline numberOfLines={4} textAlignVertical="top" /><TouchableOpacity style={styles.saveBtn} onPress={handleAddNote} activeOpacity={0.8}><Text style={styles.saveBtnText}>Save Note</Text></TouchableOpacity></View>)}
                            {trip.notes.length === 0 ? (<View style={styles.emptyTab}><FileText size={32} color={Colors.textLight} /><Text style={styles.emptyTabText}>No notes yet</Text></View>) : (trip.notes.map((note: any) => (<View key={note.id} style={styles.noteCard}><Text style={styles.noteText}>{note.content}</Text><View style={styles.noteFooter}><Text style={styles.noteDate}>{formatDate(note.createdAt)}</Text><TouchableOpacity onPress={() => deleteNote(trip.id, note.id)}><Trash2 size={14} color={Colors.textLight} /></TouchableOpacity></View></View>)))}
                        </View>
                    )}

                    {activeTab === 3 && summary && (
                        <View>
                            <View style={styles.summaryCard}><Text style={styles.summaryTitle}>Trip Summary</Text><View style={styles.summaryGrid}><View style={styles.summaryItem}><Text style={styles.summaryValue}>{summary.daysCount}</Text><Text style={styles.summaryLabel}>Days</Text></View><View style={styles.summaryItem}><Text style={styles.summaryValue}>{summary.placesVisited}</Text><Text style={styles.summaryLabel}>Places</Text></View><View style={styles.summaryItem}><Text style={styles.summaryValue}>{summary.notesCount}</Text><Text style={styles.summaryLabel}>Notes</Text></View><View style={styles.summaryItem}><Text style={styles.summaryValue}>{formatCurrency(summary.totalExpenses)}</Text><Text style={styles.summaryLabel}>Total Spent</Text></View></View></View>
                            <View style={styles.summaryCard}><Text style={styles.summaryTitle}>Expenses Breakdown</Text>{expenseCategories.map(cat => { const amount = summary.expensesByCategory[cat]; const pct = summary.totalExpenses > 0 ? (amount / summary.totalExpenses) * 100 : 0; if (amount === 0) return null; return (<View key={cat} style={styles.breakdownItem}><View style={styles.breakdownLeft}>{categoryIcons[cat]}<Text style={styles.breakdownLabel}>{expenseCategoryLabels[cat]}</Text></View><View style={styles.breakdownRight}><View style={styles.breakdownBarBg}><View style={[styles.breakdownBarFill, { width: `${pct}%`, backgroundColor: Colors.categories[cat] || Colors.textLight }]} /></View><Text style={styles.breakdownAmount}>{formatCurrency(amount)}</Text></View></View>); })}{summary.totalExpenses === 0 && (<Text style={styles.noExpensesText}>No expenses to show</Text>)}</View>
                        </View>
                    )}
                </View>
            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    notFound: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    notFoundText: { fontSize: 18, color: Colors.textSecondary, marginBottom: 16 },
    heroContainer: { height: 260, position: 'relative' },
    heroImage: { width: '100%', height: '100%' },
    heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
    heroContent: { position: 'absolute', bottom: 20, left: 20, right: 20 },
    heroTitle: { fontSize: 26, fontWeight: '800' as const, color: Colors.white, marginBottom: 6 },
    heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    heroMetaText: { fontSize: 13, color: 'rgba(255,255,255,0.9)' },
    budgetCard: { backgroundColor: Colors.white, marginHorizontal: 20, marginTop: -20, borderRadius: 18, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
    budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    budgetTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },
    statusChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.background, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusChipText: { fontSize: 12, fontWeight: '600' as const, color: Colors.textSecondary, textTransform: 'capitalize' as const },
    budgetNumbers: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    budgetSpent: { fontSize: 20, fontWeight: '800' as const, color: Colors.text },
    budgetTotal: { fontSize: 20, fontWeight: '800' as const, color: Colors.textSecondary },
    budgetRemaining: { fontSize: 20, fontWeight: '800' as const },
    budgetLabel: { fontSize: 12, color: Colors.textLight, textAlign: 'center', marginTop: 2 },
    budgetDivider: { width: 1, height: 30, backgroundColor: Colors.borderLight },
    tabBar: { flexDirection: 'row', marginHorizontal: 20, marginTop: 20, backgroundColor: Colors.white, borderRadius: 14, padding: 4 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    tabActive: { backgroundColor: Colors.primary },
    tabText: { fontSize: 13, fontWeight: '600' as const, color: Colors.textSecondary },
    tabTextActive: { color: Colors.white },
    tabContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
    emptyTab: { alignItems: 'center', paddingVertical: 40 },
    emptyTabText: { fontSize: 16, fontWeight: '600' as const, color: Colors.textSecondary, marginTop: 12 },
    daySection: { marginBottom: 20 },
    dayBadge: { backgroundColor: Colors.primaryLight, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12 },
    dayBadgeText: { fontSize: 13, fontWeight: '700' as const, color: Colors.primary },
    itineraryItem: { flexDirection: 'row', marginBottom: 8 },
    timeCol: { width: 48, paddingTop: 2 },
    timeText: { fontSize: 12, fontWeight: '600' as const, color: Colors.primary },
    itineraryLine: { width: 20, alignItems: 'center' },
    itineraryDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 5 },
    itineraryContent: { flex: 1, backgroundColor: Colors.white, borderRadius: 10, padding: 12, marginBottom: 4 },
    itineraryTitle: { fontSize: 14, fontWeight: '600' as const, color: Colors.text },
    itineraryDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
    itineraryActions: { flexDirection: 'row', gap: 12, alignItems: 'center', marginLeft: 10 },
    actionText: { color: Colors.primary, fontWeight: '700' as const },
    addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 12, marginBottom: 16 },
    addBtnText: { fontSize: 14, fontWeight: '700' as const, color: Colors.white },
    addForm: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 16 },
    categoryRow: { gap: 8, marginBottom: 12 },
    categoryChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: Colors.background, borderWidth: 1.5, borderColor: 'transparent' },
    categoryChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
    categoryChipText: { fontSize: 12, fontWeight: '600' as const, color: Colors.textSecondary },
    categoryChipTextActive: { color: Colors.primary },
    addFormRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    addFormInput: { backgroundColor: Colors.background, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.text },
    saveBtn: { backgroundColor: Colors.primary, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
    saveBtnText: { fontSize: 14, fontWeight: '700' as const, color: Colors.white },
    noteInput: { backgroundColor: Colors.background, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.text, minHeight: 80, marginBottom: 10 },
    expenseItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 12, padding: 12, marginBottom: 8, gap: 10 },
    expenseIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    expenseInfo: { flex: 1 },
    expenseName: { fontSize: 14, fontWeight: '600' as const, color: Colors.text },
    expenseCat: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
    expenseAmount: { fontSize: 15, fontWeight: '700' as const, color: Colors.text, marginRight: 8 },
    noteCard: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 10 },
    noteText: { fontSize: 14, color: Colors.text, lineHeight: 20 },
    noteFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.borderLight },
    noteDate: { fontSize: 12, color: Colors.textLight },
    summaryCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 18, marginBottom: 14 },
    summaryTitle: { fontSize: 17, fontWeight: '700' as const, color: Colors.text, marginBottom: 16 },
    summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    summaryItem: { flexGrow: 1, flexBasis: '45%', backgroundColor: Colors.background, borderRadius: 12, padding: 14, alignItems: 'center' },
    summaryValue: { fontSize: 22, fontWeight: '800' as const, color: Colors.text },
    summaryLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
    breakdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    breakdownLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, width: 110 },
    breakdownLabel: { fontSize: 13, fontWeight: '500' as const, color: Colors.text },
    breakdownRight: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
    breakdownBarBg: { flex: 1, height: 8, backgroundColor: Colors.borderLight, borderRadius: 4, overflow: 'hidden' },
    breakdownBarFill: { height: '100%', borderRadius: 4 },
    breakdownAmount: { fontSize: 13, fontWeight: '600' as const, color: Colors.text, width: 55, textAlign: 'right' },
    noExpensesText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', paddingVertical: 16 },
});
