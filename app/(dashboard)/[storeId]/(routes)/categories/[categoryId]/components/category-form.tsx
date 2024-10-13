"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { zodResolver } from "@hookform/resolvers/zod";
import { Billboard, Category } from "@prisma/client";
import axios from "axios";
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as z from "zod";

import { AlertModal } from "@/components/modals/alert-modal";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Update the validation schema to include categoryDescription
const formSchema = z.object({
  name: z.string().nonempty(),
  billboardId: z.string().nonempty(),
  categoryDescription: z.string().optional(), // Add categoryDescription field
});

type CategoryFormValues = z.infer<typeof formSchema>;

interface CategoryField {
  fieldName: string;
  fieldType: string;
  options: string[]; // Options for dropdown fields
}

interface CategoryWithFields extends Category {
  fields?: CategoryField[]; // Add fields property to Category type
}

interface CategoryFormProps {
  initialData: CategoryWithFields | null; // Update to use CategoryWithFields
  billboards: Billboard[];
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  initialData,
  billboards,
}) => {
  const params = useParams();
  const router = useRouter();

  const title = initialData ? "Edit Category" : "New Category";
  const description = initialData ? "Edit a Category" : "Add a new category";
  const toastMessage = initialData ? "Category updated." : "Category created.";
  const action = initialData ? "Save changes" : "Create category";

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fields, setFields] = useState<CategoryField[]>(
    initialData?.fields || []
  );

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      billboardId: initialData?.billboardId || "",
      categoryDescription: initialData?.categoryDescription || "",
    },
  });

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      setIsLoading(true);

      // Log the data being submitted
      const dataToSubmit = { ...values, fields };
      console.log("Submitting data:", dataToSubmit); // Log the data

      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/categories/${params.categoryId}`,
          dataToSubmit
        );
      } else {
        await axios.post(`/api/${params.storeId}/categories`, dataToSubmit);
      }

      router.refresh();
      router.push(`/${params.storeId}/categories`);
      toast.success(toastMessage);
    } catch (error) {
      console.error("Submission error mina:", error); // Log the error if any
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await axios.delete(
        `/api/${params.storeId}/categories/${params.categoryId}`
      );
      router.refresh();
      router.push(`/${params.storeId}/categories`);
      toast.success("Category deleted.");
    } catch (error) {
      toast.error("Make sure you removed all products from this category.");
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const handleAddField = () => {
    setFields([...fields, { fieldName: "", fieldType: "text", options: [] }]);
  };

  const handleFieldChange = (index: number, field: Partial<CategoryField>) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], ...field };
    setFields(updatedFields);
  };

  const handleAddOption = (index: number) => {
    const updatedFields = [...fields];
    updatedFields[index].options.push(""); // Add an empty string for the new option
    setFields(updatedFields);
  };

  const handleOptionChange = (
    fieldIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updatedFields = [...fields];
    updatedFields[fieldIndex].options[optionIndex] = value; // Update the specific option value
    setFields(updatedFields);
  };

  const handleRemoveOption = (fieldIndex: number, optionIndex: number) => {
    const updatedFields = [...fields];
    updatedFields[fieldIndex].options = updatedFields[
      fieldIndex
    ].options.filter((_, i) => i !== optionIndex);
    setFields(updatedFields);
  };

  const handleRemoveField = (index: number) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
  };

  return (
    <>
      <AlertModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={onDelete}
        isLoading={isLoading}
      />

      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            variant="destructive"
            size="icon"
            onClick={() => setIsOpen(true)}
            disabled={isLoading}
          >
            <Trash className="w-4 h-4" />
          </Button>
        )}
      </div>

      <Separator />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field: inputProps }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...inputProps}
                      disabled={isLoading}
                      placeholder="Category name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billboardId"
              render={({ field: inputProps }) => (
                <FormItem>
                  <FormLabel>Billboard</FormLabel>
                  <FormControl>
                    <Select
                      disabled={isLoading}
                      onValueChange={inputProps.onChange}
                      value={inputProps.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a billboard" />
                      </SelectTrigger>
                      <SelectContent>
                        {billboards.map((billboard) => (
                          <SelectItem key={billboard.id} value={billboard.id}>
                            {billboard.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryDescription"
              render={({ field: inputProps }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      {...inputProps}
                      disabled={isLoading}
                      placeholder="Category description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold">Fields</h3>
            <Button
              type="button"
              onClick={handleAddField}
              disabled={isLoading}
              className="mb-4"
            >
              Add Field
            </Button>
            {fields.map((field, fieldIndex) => (
              <div key={fieldIndex} className="flex flex-col space-y-4 mb-4">
                <div className="flex items-center space-x-4">
                  <Input
                    value={field.fieldName}
                    onChange={(e) =>
                      handleFieldChange(fieldIndex, {
                        fieldName: e.target.value,
                      })
                    }
                    placeholder="Field Name"
                    className="flex-grow min-w-0 "
                  />
                  <Select
                    value={field.fieldType}
                    onValueChange={(value) =>
                      handleFieldChange(fieldIndex, { fieldType: value })
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="dropdown">Dropdown</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleRemoveField(fieldIndex)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>

                {field.fieldType === "dropdown" && (
                  <div className="flex flex-col space-y-2">
                    {field.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="flex items-center space-x-2"
                      >
                        <Input
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(
                              fieldIndex,
                              optionIndex,
                              e.target.value
                            )
                          }
                          placeholder="Option"
                          className="flex-grow min-w-0"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() =>
                            handleRemoveOption(fieldIndex, optionIndex)
                          }
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      onClick={() => handleAddOption(fieldIndex)}
                      disabled={isLoading}
                    >
                      Add Option
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Button type="submit" disabled={isLoading}>
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
