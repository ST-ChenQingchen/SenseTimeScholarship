(() => {
  "use strict";

  const students = [...(window.STUDENTS || [])].sort((a, b) =>
    a.pinyin.localeCompare(b.pinyin, "en", { sensitivity: "base" })
  );

  const grid = document.querySelector("#student-grid");
  const searchInput = document.querySelector("#search-input");
  const filterGroup = document.querySelector("#filter-group");
  const filterButtons = [...document.querySelectorAll(".filter-button")];
  const resultCount = document.querySelector("#result-count");
  const emptyState = document.querySelector("#empty-state");
  const resetButton = document.querySelector("#reset-filter");
  const dialog = document.querySelector("#student-dialog");
  const closeButton = document.querySelector("#dialog-close");

  let activeCategory = "全部";
  let lastFocusedElement = null;

  const portraitPath = (student) =>
    student.photo.replace("./assets/students/", "./assets/students-anime/");

  const normalize = (value) =>
    String(value || "")
      .toLocaleLowerCase("zh-CN")
      .replace(/[\s，、/（）()·.\-_]+/g, "");

  const searchableText = (student) =>
    normalize(
      [
        student.id,
        student.name,
        student.pinyin,
        student.school,
        student.college,
        student.bio,
        student.fields.join(" "),
        student.categories.join(" ")
      ].join(" ")
    );

  const openStudent = (student, trigger) => {
    lastFocusedElement = trigger || document.activeElement;
    document.querySelector("#dialog-photo").src = portraitPath(student);
    document.querySelector("#dialog-photo").alt = `${student.name}的证件照`;
    document.querySelector("#dialog-id").textContent = student.id;
    document.querySelector("#dialog-school").textContent = student.school;
    document.querySelector("#dialog-name").textContent = student.name;
    document.querySelector("#dialog-college").textContent = `${student.college} · ${student.grade}级`;
    document.querySelector("#dialog-bio").textContent = student.bio;

    const fields = document.querySelector("#dialog-fields");
    fields.replaceChildren(
      ...student.fields.map((field) => {
        const tag = document.createElement("span");
        tag.textContent = field;
        return tag;
      })
    );

    const links = document.querySelector("#dialog-links");
    links.replaceChildren(
      ...student.links.map((item) => {
        const link = document.createElement("a");
        link.href = item.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.innerHTML = `<span>${item.label}</span><span aria-hidden="true">↗</span>`;
        return link;
      })
    );

    document.body.classList.add("dialog-open");
    dialog.showModal();
    closeButton.focus();
  };

  const closeDialog = () => {
    if (dialog.open) dialog.close();
  };

  const createCard = (student) => {
    const card = document.createElement("article");
    card.className = "student-card student-entry";

    const person = document.createElement("div");
    person.className = "card-person";

    const photoWrap = document.createElement("div");
    photoWrap.className = "card-photo";
    const photo = document.createElement("img");
    photo.src = portraitPath(student);
    photo.alt = `${student.name}的证件照`;
    photo.loading = "lazy";
    photo.width = 295;
    photo.height = 413;
    const id = document.createElement("span");
    id.className = "card-id";
    id.textContent = student.id;
    photoWrap.append(photo, id);

    const name = document.createElement("span");
    name.className = "card-name";
    name.textContent = student.name;
    person.append(photoWrap, name);

    const content = document.createElement("div");
    content.className = "card-content";

    const fields = document.createElement("div");
    fields.className = "card-fields";
    student.fields.forEach((fieldText) => {
      const field = document.createElement("span");
      field.className = "card-field";
      field.textContent = fieldText;
      fields.append(field);
    });

    const biography = document.createElement("p");
    biography.className = "card-bio";
    biography.textContent = `${student.school}${student.college}${student.bio}`;

    const actions = document.createElement("div");
    actions.className = "card-actions";

    student.links.forEach((item) => {
      const link = document.createElement("a");
      link.className = "card-link card-link-secondary";
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.innerHTML = `<span>${item.label}</span><span aria-hidden="true">↗</span>`;
      actions.append(link);
    });

    const speechLink = document.createElement("a");
    speechLink.className = "card-link card-link-primary";
    speechLink.href = `./award-speeches.html#${student.id}`;
    speechLink.textContent = "我与AI";
    actions.append(speechLink);

    content.append(fields, biography, actions);
    card.append(person, content);
    return card;
  };

  const render = () => {
    const query = normalize(searchInput.value);
    const visible = students.filter((student) => {
      const categoryMatches =
        activeCategory === "全部" || student.categories.includes(activeCategory);
      const queryMatches = !query || searchableText(student).includes(query);
      return categoryMatches && queryMatches;
    });

    const fragment = document.createDocumentFragment();
    visible.forEach((student) => fragment.append(createCard(student)));
    grid.replaceChildren(fragment);
    resultCount.textContent = String(visible.length);
    emptyState.hidden = visible.length !== 0;
  };

  const setCategory = (category) => {
    activeCategory = category;
    filterButtons.forEach((button) => {
      const isActive = button.dataset.category === category;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    render();
  };

  const updateMetrics = () => {
    const heroCount = document.querySelector("#hero-student-count");
    if (heroCount) heroCount.textContent = String(students.length);
  };

  searchInput.addEventListener("input", render);

  filterGroup.addEventListener("click", (event) => {
    const button = event.target.closest(".filter-button");
    if (button) setCategory(button.dataset.category);
  });

  resetButton.addEventListener("click", () => {
    searchInput.value = "";
    setCategory("全部");
    searchInput.focus();
  });

  closeButton.addEventListener("click", closeDialog);

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog();
  });

  dialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  });

  updateMetrics();
  render();
})();
