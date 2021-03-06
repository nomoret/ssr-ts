import React, { useState, useCallback, useEffect } from "react";
import { NextPage, NextPageContext } from "next";
import axios from "axios";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import CircularProgress from "@material-ui/core/CircularProgress";
import InputAdornment from "@material-ui/core/InputAdornment";

import { useDispatch, useSelector } from "react-redux";
import {
  SIMILIAR_WORDS_REQUEST,
  ANALOGY_WORDS_REQUEST
} from "../reducers/analysis";
import { RootState } from "../reducers";
import { AnalysisState } from "../reducers/analysis";
import useBlockIfNotLoginClient from "../lib/useBlockIfNotLoginClient";
import useBlockIfNotLogin from "../lib/useBlockIfNotLogin";
import useInput from "../lib/useInput";

interface Query {
  text: string;
  pos: string;
  positive: boolean;
}

interface Rank {
  text: string;
  score: number;
}

const optionList = Array(10)
  .fill(0, 0, 10)
  .map((v, i) => i + 1);

interface Props {}

const Word2Vec: NextPage<Props> = () => {
  useBlockIfNotLoginClient();

  return (
    <Container maxWidth="md">
      <Typography variant="h3" component="h1" gutterBottom>
        Word2Vec
      </Typography>
      <AnalogiesForm />
      <ResultPaper />
    </Container>
  );
};

const AnalogiesForm = () => {
  const wordAInput = useInput("");
  const wordBInput = useInput("");
  const wordCInput = useInput("");
  const [rankCount, setRankCount] = useState(10);

  const { isAnaloging } = useSelector<RootState, AnalysisState>(
    state => state.analysis
  );

  const dispatch = useDispatch();

  const handleOnSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      dispatch({
        type: ANALOGY_WORDS_REQUEST,
        data: {
          wordA: wordAInput.value,
          wordB: wordBInput.value,
          wordC: wordCInput.value,
          k: rankCount
        }
      });

      wordAInput.clear();
      wordBInput.clear();
      wordCInput.clear();
    },
    [wordAInput, wordBInput, wordCInput]
  );

  const handleSelectChange = useCallback(
    (e: React.ChangeEvent<{ value: unknown }>) => {
      setRankCount(e.target.value as number);
    },
    []
  );

  return (
    <form onSubmit={handleOnSubmit}>
      <TextField
        label="wordA"
        placeholder="korea"
        {...wordAInput.bind}
        variant="outlined"
        margin="normal"
        required
        autoFocus
        InputProps={{
          startAdornment: <InputAdornment position="start">+</InputAdornment>
        }}
      />
      <TextField
        label="wordB"
        placeholder="seoul"
        {...wordBInput.bind}
        variant="outlined"
        margin="normal"
        InputProps={{
          startAdornment: <InputAdornment position="start">-</InputAdornment>
        }}
      />
      <TextField
        label="wordC"
        placeholder="tokyo"
        {...wordCInput.bind}
        variant="outlined"
        margin="normal"
        InputProps={{
          startAdornment: <InputAdornment position="start">+</InputAdornment>
        }}
      />
      <InputLabel>rank count</InputLabel>
      <Select value={rankCount} onChange={handleSelectChange}>
        {optionList &&
          optionList.map(v => (
            <MenuItem key={v} value={v}>
              {v}
            </MenuItem>
          ))}
      </Select>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={isAnaloging}
        >
          Predict
        </Button>
        {isAnaloging && (
          <div
            style={{
              position: "relative",
              textAlign: "center",
              marginTop: -24
            }}
          >
            <CircularProgress size={48} />
          </div>
        )}
      </div>
    </form>
  );
};

const ResultPaper: React.FC<Props> = () => {
  const { isAnalogied, analogyResult } = useSelector<RootState, AnalysisState>(
    state => state.analysis
  );
  return (
    <Paper variant="outlined">
      <div>
        <Typography variant="h4" component="h1" gutterBottom>
          Query
        </Typography>
        <div>
          {/* {isSimilarWordFinded &&
          similarResult &&
          similarResult.query?.map((v, i) => (
            <div key={i}>{`${v[0]}/${v[1]}`}</div>
          ))} */}
        </div>
      </div>
      <div>
        <Typography variant="h4" component="h1" gutterBottom>
          Result
        </Typography>
        {isAnalogied &&
          analogyResult &&
          analogyResult.result?.map((v, i) => (
            <div key={i}>{`${v[1]} - ${v[0]} %`}</div>
          ))}
      </div>
    </Paper>
  );
};

const SimilarForm = () => {
  const [value, setValue] = useState("");
  const [rankCount, setRankCount] = useState(10);

  const {
    similarResult,
    isSimilarWordFinding,
    isSimilarWordFinded
  } = useSelector<RootState, AnalysisState>(state => state.analysis);

  const dispatch = useDispatch();

  const handleOnSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      console.log("final input : ", value);

      dispatch({
        type: SIMILIAR_WORDS_REQUEST,
        data: {
          query: value,
          k: rankCount
        }
      });

      setValue("");
    },
    [value, rankCount]
  );

  const handleOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
    },
    []
  );

  const handleSelectChange = useCallback(
    (e: React.ChangeEvent<{ value: unknown }>) => {
      setRankCount(e.target.value as number);
    },
    []
  );

  return (
    <div>
      <form onSubmit={handleOnSubmit}>
        <TextField
          placeholder="korea-seoul+tokyo"
          onChange={handleOnChange}
          value={value}
          variant="outlined"
          margin="normal"
          required
          fullWidth
          autoFocus
        />
        <InputLabel>rank count</InputLabel>
        <Select value={rankCount} onChange={handleSelectChange}>
          {optionList &&
            optionList.map(v => (
              <MenuItem key={v} value={v}>
                {v}
              </MenuItem>
            ))}
        </Select>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isSimilarWordFinding}
          >
            Predict
          </Button>
          {isSimilarWordFinding && (
            <div
              style={{
                position: "relative",
                textAlign: "center",
                marginTop: -24
              }}
            >
              <CircularProgress size={48} />
            </div>
          )}
        </div>
      </form>
      <Paper variant="outlined">
        <div>
          <Typography variant="h4" component="h1" gutterBottom>
            Query
          </Typography>
          <div>
            {isSimilarWordFinded &&
              similarResult &&
              similarResult.query?.map((v, i) => (
                <div key={i}>{`${v[0]}/${v[1]}`}</div>
              ))}
          </div>
        </div>
        <div>
          <Typography variant="h4" component="h1" gutterBottom>
            Result
          </Typography>
          {isSimilarWordFinded &&
            similarResult &&
            similarResult.result?.map((v, i) => (
              <div key={i}>{`${v[1]} - ${v[0]} %`}</div>
            ))}
        </div>
      </Paper>
    </div>
  );
};

export default Word2Vec;
