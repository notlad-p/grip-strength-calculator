import "@mantine/core/styles.css";
import {
  Button,
  MantineProvider,
  NativeSelect,
  NumberInput,
} from "@mantine/core";
import { theme } from "./theme";
import "./index.css";
import data from "./data.json";
import ReactSpeedometer from "react-d3-speedometer";
import { useState } from "react";
import CodeIcon from "./CodeIcon";

function lerp(start: number, end: number, factor: number) {
  return start + (end - start) * factor;
}

// TODO: ask what text to display after calculating
// TODO: show all percentiles chart under? (and where they fall)

type SpedometerDataType = {
  value: number;
  min: number;
  max: number;
  segmentStops: number[];
};

const Code = () => {
  return (
    <div className="size-5 fill-neutral-400">
      <CodeIcon />
    </div>
  );
};

export default function App() {
  const [spedometerData, setSpedometerData] = useState<SpedometerDataType>({
    value: 0,
    min: 0,
    max: 40,
    segmentStops: [0, 10, 30, 40],
  });
  const [forceRender, setForceRender] = useState(false);

  const [sex, setSex] = useState<"male" | "female">("male");
  const [age, setAge] = useState<string | number>("");
  const [gripStrength, setGripStrength] = useState<string | number>("");

  const onCalculateClick = () => {
    let sexData = data[sex];
    if (!age) {
      return;
    }

    if (!gripStrength) {
      return;
    }

    // find age less than `maxAge`, unless over 100
    // loop keys that start with "P" into array & set segment stops
    let ageData = sexData.find((val) => val.maxAge > age);

    // if age is 100+
    if (!ageData) {
      ageData = sexData[sexData.length - 1];
    }

    const min = Number(ageData["P5"]);
    const mid = Number(ageData["P50"]);
    const max = Number(ageData["P95"]);

    let value = Number(gripStrength);

    if (value > max) {
      value = max;
    }

    if (value < min) {
      value = min;
    }

    setForceRender(true);
    setSpedometerData({
      value,
      min,
      max,
      segmentStops: [min, Number(ageData["P30"]), Number(ageData["P80"]), max],
    });

    setTimeout(() => setForceRender(false), 150);
  };

  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <div className="p-4 max-w-fit h-screen mx-auto flex items-center flex-col">
        <ReactSpeedometer
          value={spedometerData.value}
          minValue={spedometerData.min}
          maxValue={spedometerData.max}
          currentValueText="${value} kg"
          valueTextFontSize="24px"
          paddingVertical={16}
          customSegmentStops={spedometerData.segmentStops}
          segmentColors={["#ef4444", "#fde047", "#84cc16"]}
          segmentValueFormatter={(val) => `${val} kg`}
          height={200}
          //customSegmentLabels={[
          //  { text: "P30", position: "OUTSIDE", color: "white" },
          //  { text: "P80", position: "OUTSIDE", color: "white" },
          //  { text: "P95", position: "OUTSIDE", color: "white" },
          //]}
          segments={3}
          forceRender={forceRender}
        />

        <div className="max-w-48 flex flex-col gap-3">
          <NativeSelect
            value={sex}
            onChange={(event) => setSex(event.currentTarget.value)}
            label="Sex"
            data={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
            ]}
          />

          <NumberInput
            value={age}
            onChange={setAge}
            label="Age"
            placeholder="Enter your age"
            allowNegative={false}
            allowLeadingZeros={false}
            allowDecimal={false}
          />

          <NumberInput
            value={gripStrength}
            onChange={setGripStrength}
            label="Grip Strength (kg)"
            placeholder="Enter your grip strength"
            allowNegative={false}
            allowLeadingZeros={false}
            suffix=" kg"
          />

          <Button onClick={onCalculateClick}>Calculate</Button>
        </div>

        <div className="mt-auto pt-16">
          <Button
            component="a"
            variant="subtle"
            color="#a3a3a3"
            leftSection={<Code />}
            href="https://github.com/notlad-p/grip-strength-calculator"
            target="_blank"
            rel="noopener noreferrer"
          >
            Code
          </Button>
        </div>
      </div>
    </MantineProvider>
  );
}
