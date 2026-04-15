'use client';

import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { LogIn } from 'lucide-react';

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Required'),
});

const initialValues = {
  email: '',
  password: '',
};

type LoginValues = typeof initialValues;

export const LoginForm = () => {
  const handleSubmit = async (
    values: LoginValues,
    { setSubmitting }: FormikHelpers<LoginValues>
  ) => {
    try {
      console.log('Login request:', values);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
     
      <div className="text-center mb-8">
        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogIn className="text-blue-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
        <p className="text-slate-500 text-sm">Log in to your CareHub account</p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={loginSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <Field
                name="email"
                type="email"
                className={`w-full p-3 rounded-lg border outline-none transition-all text-black ${
                  errors.email && touched.email
                    ? 'border-red-500 bg-red-50'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                }`}
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-xs mt-1 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Password
              </label>
              <Field
                name="password"
                type="password"
                className={`w-full p-3 rounded-lg border outline-none transition-all text-black ${
                  errors.password && touched.password
                    ? 'border-red-500 bg-red-50'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                }`}
              />
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500 text-xs mt-1 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-slate-300"
            >
              {isSubmitting ? 'Verifying...' : 'Sign In'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};