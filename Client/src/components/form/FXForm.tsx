import React, { ReactNode, forwardRef } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";

interface formConfig {
  defaultValues?: Record<string, any>;
  resolver?: any;
}

interface IProps extends formConfig {
  children: ReactNode;
  onSubmit: SubmitHandler<any>;
}

const FXForm = forwardRef<HTMLFormElement, IProps>(
  ({ children, onSubmit, defaultValues, resolver }: IProps, ref) => {
    const formConfig: formConfig = {};

    if (defaultValues) {
      formConfig["defaultValues"] = defaultValues;
    }

    if (resolver) {
      formConfig["resolver"] = resolver;
    }

    const methods = useForm(formConfig);

    const submitHandler = methods.handleSubmit;

    return (
      <FormProvider {...methods}>
        <form ref={ref} onSubmit={submitHandler(onSubmit)}>
          {children}
        </form>
      </FormProvider>
    );
  }
);

// Add display name for debugging purposes
FXForm.displayName = "FXForm";

export default FXForm;