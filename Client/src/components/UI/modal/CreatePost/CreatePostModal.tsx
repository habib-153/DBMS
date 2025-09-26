import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import React, { ChangeEvent, useState, useEffect, Key } from "react";
import {
  FieldValues,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { Modal, ModalContent } from "@heroui/modal";
import { useRouter } from "next/navigation";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";

import Loading from "../../Loading";

import CTDatePicker from "@/src/components/form/CTDatePicker";
import FXInput from "@/src/components/form/FXInput";
import FXTextarea from "@/src/components/form/FXTextArea";
import generateImageDescription from "@/src/services/ImageDescription";
import { useCreatePost } from "@/src/hooks/post.hook";
import { useUser } from "@/src/context/user.provider";
import dateToISO from "@/src/utils/dateToISO";
import { IPost } from "@/src/types";

interface IPostModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CreatePostModal = ({ isOpen, setIsOpen }: IPostModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFiles, setImageFiles] = useState<File[] | []>([]);
  const [imagePreviews, setImagePreviews] = useState<string[] | []>([]);

  const { user } = useUser();

  const router = useRouter();

  const {
    mutate: handleCreatePost,
    isPending: createPostPending,
    isSuccess
  } = useCreatePost();

  const methods = useForm();

  const { control, handleSubmit } = methods;

  const [divisions, setDivisions] = useState<{ id: string; name: string }[]>(
    []
  );
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>(
    []
  );
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  useEffect(() => {
    fetch("https://bdapi.vercel.app/api/v.1/division")
      .then((response) => response.json())
      .then((data) => setDivisions(data.data));
  }, []);

  useEffect(() => {
    if (selectedDivision) {
      fetch(`https://bdapi.vercel.app/api/v.1/district/${selectedDivision}`)
        .then((response) => response.json())
        .then((data) => setDistricts(data.data));
    }
  }, [selectedDivision]);

  const handleDivisionSelect = (key: Key) => {
    setSelectedDivision(String(key));
    setSelectedDistrict(""); // Reset district when division changes
  };

  const handleDistrictSelect = (key: Key) => {
    setSelectedDistrict(String(key));
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    const formData = new FormData();

    const postData : Partial<IPost> = {
      ...data,
      crimeDate: dateToISO(data.crimeDate),
      postDate: new Date(),
      author: user!._id,
      division: selectedDivision,
      district: selectedDistrict,
      location: `${
        divisions.find((div) => div.id === selectedDivision)?.name || ""
      }, ${districts.find((dist) => dist.id === selectedDistrict)?.name || ""}`,
    };

    // Append the data correctly
    formData.append("data", JSON.stringify(postData));

      formData.append("image", imageFiles[0]);

    handleCreatePost(formData);
    setIsOpen(false);

  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files![0];

    setImageFiles((prev) => [...prev, file]);

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleDescriptionGeneration = async () => {
    setIsLoading(true);
    try {
      const response = await generateImageDescription(
        imagePreviews[0],
        "write a description for this scenario based on the image"
      );

      methods.setValue("description", response);
      setIsLoading(false);
    } catch (error: any) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  if (!createPostPending && isSuccess) {
    router.push("/");
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        scrollBehavior="outside"
        size="3xl"
        onOpenChange={setIsOpen}
      >
        <ModalContent>
          {(onClose) => (
            <>
              {createPostPending && <Loading />}
              <div className="h-full rounded-xl bg-gradient-to-b from-default-100 px-[73px] py-12">
                <h1 className="text-2xl font-semibold">Post a Crime</h1>
                <Divider className="mb-5 mt-3" />
                <FormProvider {...methods}>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-wrap gap-2 py-2">
                      <div className="min-w-fit flex-1">
                        <FXInput label="Title" name="title" />
                      </div>
                      <div className="min-w-fit flex-1">
                        <CTDatePicker label="Crime date" name="crimeDate" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 py-2">
                      <div className="min-w-fit flex-1">
                        <Dropdown>
                          <DropdownTrigger>
                            <Button
                              className="w-full justify-between"
                              variant="bordered"
                            >
                              {divisions.find(
                                (div) => div.id === selectedDivision
                              )?.name || "Select Division"}
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu
                            aria-label="Select division"
                            selectedKeys={
                              selectedDivision ? [selectedDivision] : []
                            }
                            selectionMode="single"
                            onAction={handleDivisionSelect}
                          >
                            {divisions.map((division) => (
                              <DropdownItem key={division.id}>
                                {division.name}
                              </DropdownItem>
                            ))}
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                      <div className="min-w-fit flex-1">
                        <Dropdown>
                          <DropdownTrigger>
                            <Button
                              className="w-full justify-between"
                              isDisabled={!selectedDivision}
                              variant="bordered"
                            >
                              {districts.find(
                                (dist) => dist.id === selectedDistrict
                              )?.name || "Select District"}
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu
                            aria-label="Select district"
                            selectedKeys={
                              selectedDistrict ? [selectedDistrict] : []
                            }
                            selectionMode="single"
                            onAction={handleDistrictSelect}
                          >
                            {districts.map((district) => (
                              <DropdownItem key={district.id}>
                                {district.name}
                              </DropdownItem>
                            ))}
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 py-2">
                      <div className="min-w-fit flex-1">
                        <label
                          className="flex h-14 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-default-200 text-default-500 shadow-sm transition-all duration-100 hover:border-default-400"
                          htmlFor="image"
                        >
                          Upload image
                        </label>
                        <input
                          multiple
                          className="hidden"
                          id="image"
                          type="file"
                          onChange={(e) => handleImageChange(e)}
                        />
                      </div>
                    </div>

                    {imagePreviews.length > 0 && (
                      <div className="flex gap-5 my-5 flex-wrap">
                        {imagePreviews.map((imageDataUrl) => (
                          <div
                            key={imageDataUrl}
                            className="relative size-48 rounded-xl border-2 border-dashed border-default-300 p-2"
                          >
                            <img
                              alt="item"
                              className="h-full w-full object-cover object-center rounded-md"
                              src={imageDataUrl}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap-reverse gap-2 py-2">
                      <div className="min-w-fit flex-1">
                        <FXTextarea label="Description" name="description" />
                      </div>
                    </div>

                    <div className="flex justify-end gap-5">
                      {methods.getValues("description") && (
                        <Button
                          onClick={() => methods.resetField("description")}
                        >
                          Clear
                        </Button>
                      )}
                      <Button
                        isDisabled={imagePreviews.length > 0 ? false : true}
                        isLoading={isLoading}
                        onClick={() => handleDescriptionGeneration()}
                      >
                        {isLoading ? "Generating...." : "Generate with AI"}
                      </Button>
                    </div>

                    <Divider className="my-5" />

                    <Divider className="my-5" />
                    <div className="flex justify-end">
                      <Button color="danger" variant="light" onPress={onClose}>
                        Cancel
                      </Button>
                      <Button size="lg" type="submit">
                        Post
                      </Button>
                    </div>
                  </form>
                </FormProvider>
              </div>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreatePostModal;
