import { Text, View, StyleSheet, Button } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect, useState } from "react";
import { DeviceMotion } from "expo-sensors";
import React from "react";

const colors = {
  red: "#ff6666",
  green: "#ccffcc",
  white: "#fff",
};

const words = [
  "Унтах",
  "Хэвтэх",
  "Идэх",
  "Уух",
  "Тоглох",
  "Уйлах",
  "Инээх",
  "Зурах",
  "Гайхах",
  "Нохой",
  "Гахай",
  "Тахиа",
  "Туулай",
  "Муур",
  "Эрвээхэй",
  "Бар",
  "Хулгана",
  "Хулгана",
  "Үхэр",
  "Сармагчин",
  "Тэмээ",
  "Заан",
  "Баах",
  "Шээх",
  "Үнэг",
];

const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
};
const getRandomWord = () => {
  return words[getRandomNumber(0, words.length - 1)];
};

export default function App() {
  const initialWord = getRandomWord();
  const [used, setUsed] = useState([initialWord]);
  const [color, setColor] = useState<"white" | "green" | "red">("white");
  const [word, setWord] = useState(initialWord);
  const [timer, setTimer] = useState(60);
  const [score, setScore] = useState(0);
  const [motion, setMotion] = useState(-2);
  const [rotate, setRotate] = useState<number>();
  const [isGameOver, setIsGameOver] = useState(false);
  const intervalRef = React.useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timer === 0 || timer < 0) {
      setIsGameOver(true);
      clearInterval(intervalRef.current!);
    }
    intervalRef.current = setInterval(() => {
      setTimer((seconds) => (seconds > 0 ? seconds - 1 : 0));
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timer]);

  const restart = () => {
    setTimer(60);
    setScore(0);
    setUsed([]);
    setIsGameOver(false);
  };

  const getUnusedWord = (): string => {
    const newWord = getRandomWord();
    if (used.includes(newWord)) {
      return getUnusedWord();
    }
    return newWord;
  };

  const correct = () => {
    setColor("green");
    const newWord = getUnusedWord();
    setUsed((prev) => [...prev, newWord]);
    setWord(newWord);
    setScore((prev) => prev + 1);
  };

  const pass = () => {
    setColor("red");
    const newWord = getUnusedWord();
    setUsed((prev) => [...prev, newWord]);
    setWord(newWord);
  };

  useEffect(() => {
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
    );
    DeviceMotion.addListener(({ rotation }) => {
      const { gamma } = rotation;
      const roundedGamma = Math.floor(gamma);
      setRotate(roundedGamma);
      setMotion((prev) => {
        if (prev === -1 && roundedGamma === -2) {
          pass();
          return roundedGamma;
        } else if (prev === -3 && roundedGamma === -2) {
          correct();
          return roundedGamma;
        } else {
          return roundedGamma;
        }
      });
    });

    return () => {
      DeviceMotion.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    if (color === "green" || color === "red") {
      setTimeout(() => {
        setColor("white");
      }, 500);
    }
  }, [color]);

  return (
    <View style={[styles.container, { backgroundColor: colors[color] }]}>
      <Text
        style={{
          fontWeight: "500",
          fontSize: 25,
        }}
      >
        Seconds: {timer}
      </Text>

      <Text style={{ fontWeight: "bold", fontSize: 50 }}>{word}</Text>
      <Text>score:{score}</Text>
      {isGameOver ? (
        <View style={styles.gameOver}>
          <Text style={styles.gameOverText}>Game over</Text>
          <Button title="Restart" onPress={restart} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  gameOver: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  gameOverText: {
    color: "#fff",
    fontWeight: "bold",
    textTransform: "uppercase",
    fontSize: 72,
  },
});
