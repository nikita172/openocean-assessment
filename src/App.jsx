import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import './App.css'

function App() {
  const [AllColors, setAllColors] = useState(null);
  const [colors, setColors] = useState(null);
  const inputRef = useRef();

  useEffect(() => {
    const getColors = async () => {
      const res = await axios.get("https://raw.githubusercontent.com/NishantChandla/color-test-resources/main/xkcd-colors.json");
      // console.log(data);
      setAllColors(res.data.colors);
      setColors(res.data.colors);
    }
    getColors();
  }, [])

  function hexToRGB(hex) {
    hex = hex.replace(/^#/, '');
    return [
      parseInt(hex.substring(0, 2), 16),
      parseInt(hex.substring(2, 4), 16),
      parseInt(hex.substring(4, 6), 16)
    ];
  }
  const hex2rgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return r + "," + g + "," + b;
  }

  function hexToHSL(hex) {
    hex = hex.replace(/^#/, '');
    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    let normalizedR = r / 255;
    let normalizedG = g / 255;
    let normalizedB = b / 255;
    let cmin = Math.min(normalizedR, normalizedG, normalizedB);
    let cmax = Math.max(normalizedR, normalizedG, normalizedB);
    let delta = cmax - cmin;
    let hue = 0;
    if (delta === 0) {
      hue = 0;
    } else if (cmax === normalizedR) {
      hue = ((normalizedG - normalizedB) / delta) % 6;
    } else if (cmax === normalizedG) {
      hue = (normalizedB - normalizedR) / delta + 2;
    } else {
      hue = (normalizedR - normalizedG) / delta + 4;
    }
    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;
    let lightness = (cmax + cmin) / 2;
    let saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
    hue = Math.round(hue);
    saturation = Math.round(saturation * 100);
    lightness = Math.round(lightness * 100);
    return `${hue}, ${saturation}, ${lightness}`;
  }

  function rgbFormat(rgb) {
    rgb = rgb.replace(/^rgb/, '');
    const newArr = rgb.split(",");
    console.log(newArr);
    const rValue = newArr[0].substring(1);
    return [
      parseInt(rValue),
      parseInt(newArr[1]),
      parseInt(newArr[2])
    ];

  }
  function hslToRGB(hsl) {
    hsl = hsl.replace(/^hsl/, '');
    const newArr = hsl.split(",");
    const hValue = newArr[0].substring(1);
    let h = parseInt(hValue);
    let s = parseInt(newArr[1]);
    let l = parseInt(newArr[2]);
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hueToRGB = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hueToRGB(p, q, h + 1 / 3);
      g = hueToRGB(p, q, h);
      b = hueToRGB(p, q, h - 1 / 3);
    }
    r = Math.round(r * 255);
    g = Math.round(g * 255);
    b = Math.round(b * 255);
    return [r, g, b];
  }

  const clickHandler = (givenHex, threshold, e) => {
    if (e.key === "Enter") {
      if (inputRef.current.value.includes('#')) {

        const baseRGB = hexToRGB(givenHex);
        console.log(baseRGB)
        const result = [];
        colors.filter(item => {
          const colorRGB = hexToRGB(item.hex);
          if (colorDistance(baseRGB, colorRGB) <= threshold) {
            result.push(item)
          }
        });
        setColors(result)
      } else if (inputRef.current.value.includes('rgb')) {
        const result = [];
        const baseRGB = rgbFormat(givenHex)
        colors.filter(item => {
          const colorRGB = hexToRGB(item.hex);
          if (colorDistance(baseRGB, colorRGB) <= threshold) {
            result.push(item)
          }
        });
        setColors(result)

      } else if (inputRef.current.value.includes('hsl')) {
        const result = [];
        const baseRGB = hslToRGB(givenHex)
        colors.filter(item => {
          const colorRGB = hexToRGB(item.hex);
          if (colorDistance(baseRGB, colorRGB) <= threshold) {
            result.push(item)
          }
        });
        setColors(result)
      }
    }
  }
  function colorDistance(rgb1, rgb2) {
    const squaredDist = rgb1.reduce((acc, val, index) => acc + (val - rgb2[index]) ** 2, 0);
    return Math.sqrt(squaredDist);
  }

  const onChangeHandler = () => {
    if (inputRef.current.value == "") {
      setColors(AllColors);
    }
  }

  return (
    <div className='appContainer'>
      <h2 className='title' >Colour Searcher</h2>
      <div className='searchBar'>
        <span className='colourTitle'>Colour</span>
        <input className='searchInput' placeholder="Enter Colour" onKeyDown={(e) => clickHandler(inputRef.current.value, 100, e)}
          onChange={onChangeHandler}
          ref={inputRef}
          style={{ backgroundColor: `${colors ? "white" : "#d9d9d9"}` }} />
      </div>
      <>{
        colors ?
          <div className="allResults">
            <span className='allColoursTitle'>All Colours.</span>
            <div className='tableHeading'>
              <div className='colourPalleteEmpty'></div>
              <div className='NameHeading'>Name</div>
              <div className='hexHeading'>Hex</div>
              <div className='rgbHeading'>RGB</div>
              <div className='hslHeading'>HSL</div>
            </div>
            <div className='tableRows'>
              {colors?.map((item, idx) => (
                <div className='tableData' key={idx}>
                  <div className='colourPallete' style={{ backgroundColor: `${item.hex}` }}></div>
                  <div className='NameHeading'>{item.color}</div>
                  <div className='hexHeading'>{item.hex}</div>
                  <div className='rgbHeading'>{hex2rgb(item.hex)}</div>
                  <div className='hslHeading'>{hexToHSL(item.hex)}</div>
                </div>
              ))}
            </div>
          </div> :
          <div className='loading'>Loading...</div>
      }
      </>
    </div>
  )
}

export default App
