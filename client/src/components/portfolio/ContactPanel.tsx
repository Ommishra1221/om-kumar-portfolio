import { useRef, useState } from "react";
import type { FormEvent } from "react";
import emailjs from "@emailjs/browser";
import { AlertTriangle, ArrowRight, CheckCircle2, Send } from "lucide-react";
import { profile } from "@/data/portfolio";
import { haptic } from "@/lib/haptics";
import "./ContactPanel.css";

type FieldName = "name" | "email" | "subject" | "message";
type Status = "idle" | "sending" | "created" | "failed";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const fields: Array<{
  name: FieldName;
  label: string;
  placeholder: string;
  kind: "input" | "textarea";
  autoComplete?: string;
}> = [
  { name: "name", label: "Name", placeholder: "Your name", kind: "input", autoComplete: "name" },
  { name: "email", label: "Email", placeholder: "you@company.com", kind: "input", autoComplete: "email" },
  { name: "subject", label: "Subject", placeholder: "Java Backend opportunity", kind: "input" },
  { name: "message", label: "Message", placeholder: "Tell me about the opportunity, team, or system challenge…", kind: "textarea" },
];

function validate(values: Record<FieldName, string>): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};

  if (values.name.trim().length < 2) errors.name = "Enter your name so I know who I'm replying to.";
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = "Enter an email address I can reply to.";
  if (values.subject.trim().length < 3) errors.subject = "Add a short subject line.";
  if (values.message.trim().length < 10) errors.message = "Add a little more detail — at least 10 characters.";

  return errors;
}

/**
 * Contact as a POST request.
 *
 * Field names are unchanged from the original form so the existing EmailJS
 * template keeps working. Validation is inline and announced, and the form never
 * depends on haptics or animation to communicate its state.
 */
export default function ContactPanel() {
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Record<FieldName, string>>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [notice, setNotice] = useState("");

  const update = (name: FieldName, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    // Clear a field's error as soon as it becomes valid again.
    setErrors((current) => {
      if (!current[name]) return current;
      const next = validate({ ...values, [name]: value });
      return { ...current, [name]: next[name] };
    });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const found = validate(values);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      setStatus("failed");
      setNotice("Request rejected (400). Fix the highlighted fields and send again.");
      haptic("error");
      const firstField = (Object.keys(found) as FieldName[])[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${firstField}"]`)?.focus();
      return;
    }

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      setStatus("failed");
      setNotice(`Email delivery is not configured on this deployment. Reach me directly at ${profile.email}.`);
      haptic("error");
      return;
    }

    setStatus("sending");
    setNotice("");

    try {
      await emailjs.sendForm(serviceId, templateId, formRef.current!, { publicKey });
      setStatus("created");
      setNotice("");
      setValues({ name: "", email: "", subject: "", message: "" });
      haptic("success");
    } catch (error) {
      console.error("EmailJS error:", error);
      setStatus("failed");
      setNotice(`Delivery failed (500). Try again, or email me directly at ${profile.email}.`);
      haptic("error");
    }
  };

  const errorList = Object.entries(errors) as Array<[FieldName, string]>;

  return (
    <form className="endpoint-form" ref={formRef} onSubmit={submit} noValidate data-status={status}>
      <div className="form-heading">
        <span className="method" data-method="POST">
          POST
        </span>
        <code>/contact</code>
      </div>

      {errorList.length > 0 && (
        <div className="form-summary" role="alert">
          <AlertTriangle size={15} aria-hidden="true" />
          <div>
            <b>400 Bad Request</b>
            <ul>
              {errorList.map(([name, message]) => (
                <li key={name}>
                  <a href={`#field-${name}`}>{message}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="form-grid">
        {fields.slice(0, 2).map((field) => (
          <Field
            key={field.name}
            {...field}
            value={values[field.name]}
            error={errors[field.name]}
            onChange={update}
          />
        ))}
      </div>

      {fields.slice(2).map((field) => (
        <Field
          key={field.name}
          {...field}
          value={values[field.name]}
          error={errors[field.name]}
          onChange={update}
        />
      ))}

      <div className="form-actions">
        <button type="submit" className="ripple" disabled={status === "sending"} onPointerDown={() => haptic("tap")}>
          {status === "sending" ? (
            "Sending…"
          ) : (
            <>
              <Send size={15} aria-hidden="true" />
              Send message
              <ArrowRight size={14} aria-hidden="true" />
            </>
          )}
        </button>
      </div>

      <p className="form-status" role="status" data-tone={status === "created" ? "ok" : status === "failed" ? "error" : "idle"}>
        {status === "created" && (
          <>
            <CheckCircle2 size={15} aria-hidden="true" />
            <b>201 Created</b> — message received. I'll reply to you directly.
          </>
        )}
        {status === "failed" && notice}
      </p>
    </form>
  );
}

function Field({
  name,
  label,
  placeholder,
  kind,
  autoComplete,
  value,
  error,
  onChange,
}: {
  name: FieldName;
  label: string;
  placeholder: string;
  kind: "input" | "textarea";
  autoComplete?: string;
  value: string;
  error?: string;
  onChange: (name: FieldName, value: string) => void;
}) {
  const errorId = `error-${name}`;
  const shared = {
    id: `field-${name}`,
    name,
    placeholder,
    value,
    "aria-invalid": error ? ("true" as const) : undefined,
    "aria-describedby": error ? errorId : undefined,
    onChange: (event: { target: { value: string } }) => onChange(name, event.target.value),
  };

  return (
    <label htmlFor={`field-${name}`}>
      <span>
        {label}
        <i aria-hidden="true">*</i>
      </span>
      {kind === "textarea" ? (
        <textarea rows={6} {...shared} />
      ) : (
        <input
          type={name === "email" ? "email" : "text"}
          inputMode={name === "email" ? "email" : undefined}
          autoComplete={autoComplete}
          {...shared}
        />
      )}
      {error && (
        <small className="field-error" id={errorId}>
          {error}
        </small>
      )}
    </label>
  );
}
