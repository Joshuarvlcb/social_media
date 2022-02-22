import { useState } from "react";
import { List, Image, Search } from "semantic-ui-react";
import axios from "axios";
import Router from "next/router";
import { baseURL } from "../../util/auth";
import cookie from "js-cookie";
let cancel;

const flatArray = (arr) => {
  arr.forEach((val, i) => {
    if (Array.isArray(val)) {
      let newVal = [...val];
      arr[i] = newVal;
      return flatArray(arr);
    }
  });
  return arr;
};

const SearchComponent = () => {
  const [text, setText] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = async (e) => {
    const { value } = e.target;

    if (value === " ") return;
    if (value) setLoading(true);
    setText(value);

    try {
      cancel && cancel();

      const token = cookie.get("token");
      const res = await axios.get(`${baseURL}/api/v1/search/${value}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cancelToken: new axios.CancelToken((canceler) => {
          cancel = canceler;
        }),
      });

      if (res.data.length === 0) {
        setResults([]);
        return setLoading(false);
      }
      setResults(res.data);
    } catch (err) {
      console.log("error searching @ search components", err);
    }
    setLoading(false);
  };

  return (
    <Search
      onSearchChange={handleChange}
      loading={loading}
      results={results || null}
      value={text}
      placeholder="find other users"
      onBlur={() => {
        results.length > 0 && setResults([]);
        loading && setLoading(false);
        setText("");
      }}
      resultRenderer={ResultRenderer}
      onResultSelect={(_, { result }) => {
        return Router.push(`/${data.result.username}`);
      }}
    />
  );
};

const ResultRenderer = ({ _id, profilePicURL, name }) => {
  return (
    <>
      <List key={_id}>
        <List.Item>
          <Image
            style={{
              objectFit: "contain",
              height: "1.5rem",
              width: "1.5rem",
            }}
            src={profilePicURL}
          />
          <List.Content header={name} as="a" />
        </List.Item>
      </List>
    </>
  );
};

export default SearchComponent;
