import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

type ActiveGame = 'menu' | 'puzzle' | 'memory' | 'quickQuiz';

// --- GAME 1: 3x3 Sliding Puzzle State & Helpers ---
const INITIAL_PUZZLE = [1, 2, 3, 4, 5, 6, 7, 8, 0]; // 0 is empty

function isSolvable(arr: number[]): boolean {
  let inversions = 0;
  const filtered = arr.filter(n => n !== 0);
  for (let i = 0; i < filtered.length - 1; i++) {
    for (let j = i + 1; j < filtered.length; j++) {
      if (filtered[i] > filtered[j]) inversions++;
    }
  }
  return inversions % 2 === 0;
}

function getShuffledPuzzle(): number[] {
  let shuffled: number[];
  do {
    shuffled = [...INITIAL_PUZZLE].sort(() => Math.random() - 0.5);
  } while (!isSolvable(shuffled) || isPuzzleSolved(shuffled));
  return shuffled;
}

function isPuzzleSolved(arr: number[]): boolean {
  for (let i = 0; i < 8; i++) {
    if (arr[i] !== i + 1) return false;
  }
  return arr[8] === 0;
}

// --- GAME 2: Memory Card Match ---
const MEMORY_ICONS = ['⚛️', '🧬', '💻', '🔬', '📐', '📚'];

interface MemoryCard {
  id: number;
  icon: string;
  flipped: boolean;
  matched: boolean;
}

function getShuffledMemoryCards(): MemoryCard[] {
  const cards: MemoryCard[] = [];
  let id = 1;
  MEMORY_ICONS.forEach(icon => {
    cards.push({ id: id++, icon, flipped: false, matched: false });
    cards.push({ id: id++, icon, flipped: false, matched: false });
  });
  return cards.sort(() => Math.random() - 0.5);
}

// --- GAME 3: Quick Quiz Trivia ---
const TRIVIA_QUESTIONS = [
  { q: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Mercury'], correct: 1 },
  { q: 'What is the speed of light in vacuum?', options: ['300,000 km/s', '150,000 km/s', '50,000 km/s', '1,000,000 km/s'], correct: 0 },
  { q: 'Who proposed the Theory of Relativity?', options: ['Isaac Newton', 'Nikola Tesla', 'Albert Einstein', 'Galileo Galilei'], correct: 2 },
  { q: 'What is the chemical symbol for Gold?', options: ['Ag', 'Au', 'Fe', 'Cu'], correct: 1 },
  { q: 'What is the smallest unit of life in biology?', options: ['Atom', 'Tissue', 'Cell', 'Organelle'], correct: 2 },
  { q: 'In computing, how many bits are in a byte?', options: ['4', '8', '16', '32'], correct: 1 },
  { q: 'Which gas do plants primarily absorb during photosynthesis?', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Methane'], correct: 1 }
];

export const GamesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeGame, setActiveGame] = useState<ActiveGame>('menu');

  // --- Puzzle State ---
  const [puzzleGrid, setPuzzleGrid] = useState<number[]>(INITIAL_PUZZLE);
  const [puzzleMoves, setPuzzleMoves] = useState(0);
  const [puzzleWon, setPuzzleWon] = useState(false);

  // --- Memory Game State ---
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryMatches, setMemoryMatches] = useState(0);

  // --- Quick Quiz State ---
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [triviaScore, setTriviaScore] = useState(0);
  const [triviaTimeLeft, setTriviaTimeLeft] = useState(45);
  const [triviaRunning, setTriviaRunning] = useState(false);
  const [triviaFinished, setTriviaFinished] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize games
  const startPuzzle = () => {
    setPuzzleGrid(getShuffledPuzzle());
    setPuzzleMoves(0);
    setPuzzleWon(false);
    setActiveGame('puzzle');
  };

  const handleTilePress = (index: number) => {
    if (puzzleWon) return;
    const emptyIndex = puzzleGrid.indexOf(0);
    const row = Math.floor(index / 3);
    const col = index % 3;
    const emptyRow = Math.floor(emptyIndex / 3);
    const emptyCol = emptyIndex % 3;

    // Adjacent check (manhattan distance = 1)
    const isAdjacent = Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;
    if (isAdjacent) {
      const newGrid = [...puzzleGrid];
      newGrid[emptyIndex] = newGrid[index];
      newGrid[index] = 0;
      setPuzzleGrid(newGrid);
      setPuzzleMoves(m => m + 1);

      if (isPuzzleSolved(newGrid)) {
        setPuzzleWon(true);
        Alert.alert('Congratulations! 🎉', `Sliding puzzle solved in ${puzzleMoves + 1} moves!`);
      }
    }
  };

  const startMemoryGame = () => {
    setMemoryCards(getShuffledMemoryCards());
    setFlippedIndices([]);
    setMemoryMoves(0);
    setMemoryMatches(0);
    setActiveGame('memory');
  };

  const handleCardPress = (index: number) => {
    if (flippedIndices.length === 2 || memoryCards[index].flipped || memoryCards[index].matched) {
      return;
    }

    const updated = [...memoryCards];
    updated[index].flipped = true;
    const newFlipped = [...flippedIndices, index];
    setMemoryCards(updated);
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMemoryMoves(m => m + 1);
      const [idx1, idx2] = newFlipped;
      if (updated[idx1].icon === updated[idx2].icon) {
        // Matched!
        setTimeout(() => {
          updated[idx1].matched = true;
          updated[idx2].matched = true;
          setMemoryCards([...updated]);
          setFlippedIndices([]);
          setMemoryMatches(m => {
            const next = m + 1;
            if (next === 6) {
              Alert.alert('Memory Master! 🧠', `All pairs matched in ${memoryMoves + 1} moves!`);
            }
            return next;
          });
        }, 500);
      } else {
        // Not matched, flip back
        setTimeout(() => {
          updated[idx1].flipped = false;
          updated[idx2].flipped = false;
          setMemoryCards([...updated]);
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  const startQuickQuiz = () => {
    setTriviaIndex(0);
    setTriviaScore(0);
    setTriviaTimeLeft(45);
    setTriviaRunning(true);
    setTriviaFinished(false);
    setActiveGame('quickQuiz');
  };

  useEffect(() => {
    if (triviaRunning && triviaTimeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTriviaTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            setTriviaRunning(false);
            setTriviaFinished(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [triviaRunning, triviaTimeLeft]);

  const handleTriviaAnswer = (optionIdx: number) => {
    const q = TRIVIA_QUESTIONS[triviaIndex];
    if (optionIdx === q.correct) {
      setTriviaScore(s => s + 10);
    }

    if (triviaIndex < TRIVIA_QUESTIONS.length - 1) {
      setTriviaIndex(i => i + 1);
    } else {
      setTriviaRunning(false);
      setTriviaFinished(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (activeGame !== 'menu') {
              setActiveGame('menu');
            } else {
              navigation.goBack();
            }
          }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Brain Break Mini-Games</Text>
          <Text style={styles.headerSubtitle}>
            {activeGame === 'puzzle'
              ? 'Sliding Tile 8-Puzzle'
              : activeGame === 'memory'
              ? 'Memory Pair Match'
              : activeGame === 'quickQuiz'
              ? '45s Trivia Sprint'
              : 'Recharge your cognitive focus'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* --- 1. GAMES MENU --- */}
        {activeGame === 'menu' && (
          <View style={styles.menuContainer}>
            {/* Sliding Puzzle Tile */}
            <Card style={styles.gameCard}>
              <View style={styles.gameCardHeader}>
                <View style={[styles.gameIconBox, { backgroundColor: '#EEF2FF' }]}>
                  <Ionicons name="grid" size={26} color="#4F46E5" />
                </View>
                <View style={styles.gameTitles}>
                  <Text style={styles.gameTitle}>Sliding Tile Puzzle</Text>
                  <Text style={styles.gameSub}>Spatial reasoning & order logic</Text>
                </View>
              </View>
              <Text style={styles.gameDesc}>
                Slide numbered tiles into the empty space to arrange them from 1 to 8. Solvable shuffle guaranteed!
              </Text>
              <Button
                title="Play Sliding Puzzle"
                onPress={startPuzzle}
                variant="primary"
                size="md"
                icon="play"
              />
            </Card>

            {/* Memory Card Match Tile */}
            <Card style={styles.gameCard}>
              <View style={styles.gameCardHeader}>
                <View style={[styles.gameIconBox, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="sparkles" size={26} color="#10B981" />
                </View>
                <View style={styles.gameTitles}>
                  <Text style={styles.gameTitle}>Memory Card Match</Text>
                  <Text style={styles.gameSub}>Visual working memory recall</Text>
                </View>
              </View>
              <Text style={styles.gameDesc}>
                Flip and match 6 pairs of academic and science icons in as few moves as possible.
              </Text>
              <Button
                title="Play Memory Match"
                onPress={startMemoryGame}
                variant="primary"
                size="md"
                icon="play"
              />
            </Card>

            {/* Quick Quiz Trivia Tile */}
            <Card style={styles.gameCard}>
              <View style={styles.gameCardHeader}>
                <View style={[styles.gameIconBox, { backgroundColor: '#FFFBEB' }]}>
                  <Ionicons name="flash" size={26} color="#F59E0B" />
                </View>
                <View style={styles.gameTitles}>
                  <Text style={styles.gameTitle}>45s Quick Trivia Sprint</Text>
                  <Text style={styles.gameSub}>Fast-paced knowledge booster</Text>
                </View>
              </View>
              <Text style={styles.gameDesc}>
                Answer rapid science and general knowledge questions before the 45-second timer expires!
              </Text>
              <Button
                title="Start 45s Sprint"
                onPress={startQuickQuiz}
                variant="primary"
                size="md"
                icon="play"
              />
            </Card>
          </View>
        )}

        {/* --- 2. SLIDING PUZZLE GAME --- */}
        {activeGame === 'puzzle' && (
          <View style={styles.puzzleContainer}>
            <View style={styles.puzzleStatsBar}>
              <Text style={styles.puzzleStatText}>Moves: {puzzleMoves}</Text>
              <TouchableOpacity onPress={() => setPuzzleGrid(getShuffledPuzzle())}>
                <Text style={styles.shuffleText}>Reshuffle 🔀</Text>
              </TouchableOpacity>
            </View>

            {/* 3x3 Grid */}
            <View style={styles.puzzleBoard}>
              {puzzleGrid.map((val, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  disabled={val === 0 || puzzleWon}
                  onPress={() => handleTilePress(idx)}
                  style={[
                    styles.puzzleTile,
                    val === 0 && styles.puzzleEmptyTile,
                    val !== 0 && styles.puzzleActiveTile
                  ]}
                >
                  {val !== 0 && <Text style={styles.puzzleTileText}>{val}</Text>}
                </TouchableOpacity>
              ))}
            </View>

            {puzzleWon && (
              <View style={styles.winBanner}>
                <Text style={styles.winBannerText}>🎉 Solved in {puzzleMoves} moves!</Text>
                <Button
                  title="Play Again"
                  onPress={() => {
                    setPuzzleWon(false);
                    setPuzzleGrid(getShuffledPuzzle());
                    setPuzzleMoves(0);
                  }}
                  variant="primary"
                  size="sm"
                  style={{ marginTop: 8 }}
                />
              </View>
            )}

            <Button
              title="Return to Games Menu"
              onPress={() => setActiveGame('menu')}
              variant="outline"
              size="md"
              style={{ marginTop: 24 }}
            />
          </View>
        )}

        {/* --- 3. MEMORY CARD MATCH --- */}
        {activeGame === 'memory' && (
          <View style={styles.memoryContainer}>
            <View style={styles.puzzleStatsBar}>
              <Text style={styles.puzzleStatText}>Moves: {memoryMoves}</Text>
              <Text style={styles.puzzleStatText}>Matched: {memoryMatches} / 6</Text>
            </View>

            {/* 4x3 Card Grid */}
            <View style={styles.memoryGrid}>
              {memoryCards.map((card, idx) => {
                const isRevealed = card.flipped || card.matched;
                return (
                  <TouchableOpacity
                    key={card.id}
                    activeOpacity={0.8}
                    disabled={card.matched}
                    onPress={() => handleCardPress(idx)}
                    style={[
                      styles.memoryCard,
                      isRevealed && styles.memoryCardRevealed,
                      card.matched && styles.memoryCardMatched
                    ]}
                  >
                    <Text style={styles.memoryCardText}>
                      {isRevealed ? card.icon : '❓'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {memoryMatches === 6 && (
              <View style={styles.winBanner}>
                <Text style={styles.winBannerText}>🧠 All 6 pairs matched in {memoryMoves} moves!</Text>
                <Button
                  title="Play Again"
                  onPress={startMemoryGame}
                  variant="primary"
                  size="sm"
                  style={{ marginTop: 8 }}
                />
              </View>
            )}

            <Button
              title="Return to Games Menu"
              onPress={() => setActiveGame('menu')}
              variant="outline"
              size="md"
              style={{ marginTop: 24 }}
            />
          </View>
        )}

        {/* --- 4. QUICK QUIZ TRIVIA --- */}
        {activeGame === 'quickQuiz' && (
          <View style={styles.triviaContainer}>
            {!triviaFinished ? (
              <View>
                <View style={styles.triviaTimerRow}>
                  <View style={styles.triviaPill}>
                    <Ionicons name="timer-outline" size={16} color="#DC2626" />
                    <Text style={styles.triviaTimerText}>{triviaTimeLeft}s</Text>
                  </View>
                  <Text style={styles.triviaScoreText}>Score: {triviaScore} pts</Text>
                </View>

                {TRIVIA_QUESTIONS[triviaIndex] && (
                  <Card style={styles.triviaCard}>
                    <Text style={styles.triviaQCounter}>
                      Question {triviaIndex + 1} of {TRIVIA_QUESTIONS.length}
                    </Text>
                    <Text style={styles.triviaQuestionText}>
                      {TRIVIA_QUESTIONS[triviaIndex].q}
                    </Text>

                    <View style={styles.triviaOptionsList}>
                      {TRIVIA_QUESTIONS[triviaIndex].options.map((opt, oIdx) => (
                        <TouchableOpacity
                          key={oIdx}
                          activeOpacity={0.8}
                          onPress={() => handleTriviaAnswer(oIdx)}
                          style={styles.triviaOptionBtn}
                        >
                          <Text style={styles.triviaOptionText}>{opt}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </Card>
                )}
              </View>
            ) : (
              <Card style={styles.triviaFinishedCard}>
                <Ionicons name="ribbon" size={48} color="#D97706" />
                <Text style={styles.triviaFinishedTitle}>Trivia Sprint Finished!</Text>
                <Text style={styles.triviaFinalScore}>Final Score: {triviaScore} pts</Text>
                <Text style={styles.triviaFeedback}>
                  {triviaScore >= 50 ? 'Incredible speed and knowledge! ⚡' : 'Nice try! Keep training your recall!'}
                </Text>
                <Button
                  title="Play Again"
                  onPress={startQuickQuiz}
                  variant="primary"
                  size="md"
                  style={{ marginTop: 12 }}
                />
              </Card>
            )}

            <Button
              title="Return to Games Menu"
              onPress={() => setActiveGame('menu')}
              variant="outline"
              size="md"
              style={{ marginTop: 20 }}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6
  },
  headerTitleBox: {
    flex: 1
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: 40
  },
  menuContainer: {
    gap: SPACING.md
  },
  gameCard: {
    marginBottom: 0
  },
  gameCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8
  },
  gameIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center'
  },
  gameTitles: {
    flex: 1
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text
  },
  gameSub: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  gameDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: SPACING.base
  },
  puzzleContainer: {
    alignItems: 'center'
  },
  puzzleStatsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: SPACING.sm,
    marginBottom: 16
  },
  puzzleStatText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text
  },
  shuffleText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary
  },
  puzzleBoard: {
    width: 290,
    height: 290,
    backgroundColor: '#E2E8F0',
    borderRadius: RADIUS.lg,
    padding: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  puzzleTile: {
    width: 86,
    height: 86,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  puzzleActiveTile: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.small
  },
  puzzleEmptyTile: {
    backgroundColor: 'transparent'
  },
  puzzleTileText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF'
  },
  winBanner: {
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginTop: 16,
    width: '100%'
  },
  winBannerText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669'
  },
  memoryContainer: {
    alignItems: 'center'
  },
  memoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginTop: 10
  },
  memoryCard: {
    width: 76,
    height: 90,
    borderRadius: RADIUS.md,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small
  },
  memoryCardRevealed: {
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.primary
  },
  memoryCardMatched: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981'
  },
  memoryCardText: {
    fontSize: 32
  },
  triviaContainer: {
    paddingVertical: 10
  },
  triviaTimerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  triviaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 5
  },
  triviaTimerText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626'
  },
  triviaScoreText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary
  },
  triviaCard: {
    padding: SPACING.lg
  },
  triviaQCounter: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 6
  },
  triviaQuestionText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.lg
  },
  triviaOptionsList: {
    gap: 10
  },
  triviaOptionBtn: {
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 12,
    borderRadius: RADIUS.md
  },
  triviaOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text
  },
  triviaFinishedCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: 8
  },
  triviaFinishedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text
  },
  triviaFinalScore: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary
  },
  triviaFeedback: {
    fontSize: 14,
    color: COLORS.textMuted
  }
});
