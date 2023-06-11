import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/lab/LoadingButton";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { useFetchTemplates } from "./templates.actions";

const errors: Record<string, string> = {
  to: "Empty or invalid 'to' field. Provide an email address to send the test email.",
};

const Home: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [toAddr, setToAddr] = useState("");
  const [error, setError] = useState<string>();
  const [subject, setSubject] = useState<string>("");
  const { templates } = useFetchTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<Template>();

  useEffect(() => {
    if (templates?.length > 0) {
      setSelectedTemplate(templates[0]);
    }
  }, [templates]);

  const sendTestEmail = () => {
    setIsLoading(true);
    setError(undefined);

    if (!toAddr || toAddr.indexOf("@") === -1) {
      setIsLoading(false);
      setError(errors.to);

      const inputField = document.querySelector(
        "#to-field"
      ) as HTMLInputElement;

      return inputField?.focus();
    }

    const data: Record<string, string> = {};
    const form = document.querySelector(
      "#manual-email-form"
    ) as HTMLFormElement;

    selectedTemplate?.variables?.forEach((variable) => {
      const { value } = form[`data[${variable}]`] || {};

      if (value) {
        data[variable] = value.replace(/\n/g, "<br/>");
      }
    });

    fetch("/api/mail", {
      method: "POST",
      body: JSON.stringify({
        email: toAddr.split(";").map((e) => e.trim()),
        templateId: selectedTemplate?.recordId,
        data,
        subject,
      }),
    })
      .then(async (res) => {
        console.log(await res.json());
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Box
      color="info.main"
      maxWidth="md"
      sx={{
        m: "auto",
        width: "100%",
        p: 4,
        bgcolor: "rgba(0,0,0,0.05)",
        boxShadow: 1,
      }}
    >
      <Typography
        variant="h6"
        sx={{ mb: 3, opacity: 0.5, textAlign: "center" }}
      >
        Send Email Manually
      </Typography>
      <form
        id="manual-email-form"
        onSubmit={(e) => {
          e.preventDefault();
          sendTestEmail();
        }}
      >
        <Typography
          sx={{
            bgcolor: "rgba(0,0,0,0.05)",
            borderBottom: "1px solid rgba(0,0,0,0.3)",
            py: 1,
            px: 1.5,
            cursor: "not-allowed",
          }}
        >
          <Typography
            sx={{ fontSize: 12, mb: 0.25, display: "block", opacity: 0.4 }}
            component="span"
          >
            From
          </Typography>{" "}
          {process.env.MAILER_FROM_ADDR}
        </Typography>
        <Box
          sx={{
            pt: 2,
            mb: 2,
          }}
        >
          <TextField
            color="primary"
            variant="filled"
            label="To"
            value={toAddr}
            error={errors.to === error}
            autoComplete="off"
            autoFocus
            placeholder="janny@doe.com; joe@doe.com"
            InputProps={{ id: "to-field" }}
            onChange={(e) => setToAddr(e.currentTarget.value)}
            fullWidth
          />
        </Box>
        <Box
          sx={{
            mb: 2,
          }}
        >
          <TextField
            color="primary"
            variant="filled"
            label="Subject"
            value={subject}
            autoComplete="off"
            autoFocus
            placeholder={
              selectedTemplate?.defaultSubject || "Subject of the email"
            }
            onChange={(e) => setSubject(e.currentTarget.value)}
            fullWidth
          />
        </Box>
        <FormControl
          variant="filled"
          fullWidth
          sx={{ mb: selectedTemplate?.variables ? 0 : 2 }}
        >
          <InputLabel
            id="template-select"
            sx={{ color: "white", opacity: 0.4 }}
            color="info"
          >
            Template
          </InputLabel>
          <Select
            labelId="template-select"
            sx={{ color: "white" }}
            value={selectedTemplate?.recordId || ""}
            onChange={(e) => {
              setSelectedTemplate(
                templates.find((t) => t.recordId === e.target.value)
              );
            }}
          >
            {templates?.map((template) => (
              <MenuItem key={template.recordId} value={template.recordId}>
                {template.name} (#{template.recordId})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {selectedTemplate?.variables ? (
          <Box>
            <Typography
              variant="h6"
              sx={{ mb: 2, mt: 3, opacity: 0.5, textAlign: "center" }}
            >
              Template Variables
            </Typography>
            {selectedTemplate.variables.map((variable) => (
              <TextField
                key={variable}
                multiline
                fullWidth
                variant="filled"
                sx={{ mb: 2 }}
                label={`it.${variable}`}
                color="primary"
                name={`data[${variable}]`}
              />
            ))}
          </Box>
        ) : (
          ""
        )}
        {error && (
          <Alert color="error" sx={{ mb: 2 }}>
            <AlertTitle>Invalid test address</AlertTitle>
            <Typography>{error}</Typography>
          </Alert>
        )}
        <Box sx={{ textAlign: "center" }}>
          <Button
            variant="contained"
            color="secondary"
            loading={isLoading}
            type="submit"
          >
            Send email
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default Home;
