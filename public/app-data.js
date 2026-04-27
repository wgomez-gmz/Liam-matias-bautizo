(function () {
  var fallbackGuests = [
    { id: "0f4c1d7a-8b34-4e25-a9a0-5b4d9a0ef101", name: "Familia Perez", passSize: 3, table: 1 },
    { id: "2be8e7a1-9f1b-46e7-8a2d-51cbb8f86202", name: "Familia Garcia", passSize: 4, table: 1 },
    { id: "3a91f2c0-5db2-4c44-b8aa-7f0a6157b303", name: "Familia Ramirez", passSize: 5, table: 1 },
    { id: "4d6a2a59-0ea4-46d0-8e0e-848b4f5ac404", name: "Familia Lopez", passSize: 2, table: 2 },
    { id: "5c977d5e-1f42-47fa-a7bd-1df2c61d3505", name: "Familia Sanchez", passSize: 6, table: 2 },
    { id: "6f3d8f2b-b18c-4f62-8ff6-6057bb6e3d06", name: "Familia Hernandez", passSize: 3, table: 2 },
    { id: "7ae21d84-22a9-48e4-9c9f-8e90d6124c07", name: "Familia Torres", passSize: 4, table: 3 },
    { id: "8bc57f10-33dd-43ea-a7b4-3c1a4dbe1a08", name: "Familia Flores", passSize: 2, table: 3 },
    { id: "9d1f5e22-44ab-41e2-9868-f2c57ac0df09", name: "Familia Castro", passSize: 5, table: 3 },
    { id: "ad8b7c35-55c0-4bfa-b9a0-640a39e0a010", name: "Familia Mendoza", passSize: 3, table: 4 },
    { id: "be71d843-6621-46ab-86af-11ad8bb72011", name: "Ana Lopez", passSize: 2, table: 4 },
    { id: "cf9e4f57-77f2-4e44-a82f-53ee42a3bc12", name: "Juan Martinez", passSize: 4, table: 4 },
    { id: "d04b3c68-8874-4db1-9c94-9987cb48ef13", name: "Maria Garcia", passSize: 1, table: 5 },
    { id: "e1ac5d79-9985-493f-82b9-2b57e4f16a14", name: "Carlos Ortega", passSize: 2, table: 5 },
    { id: "f2bd6e8a-aa96-4fc0-a1d0-7cb4f37d9d15", name: "Lucia Navarro", passSize: 3, table: 5 },
    { id: "13ce7f9b-bba7-4ad2-b8ea-1f7c8b603e16", name: "Daniel Cruz", passSize: 1, table: 5 },
    { id: "24df80ac-ccb8-4be3-9a11-5d8d1a24af17", name: "Sofia Reyes", passSize: 2, table: 6 },
    { id: "35e091bd-ddc9-41f4-8b3e-6ef0a957d418", name: "Miguel Vargas", passSize: 4, table: 6 },
    { id: "46f1a2ce-eeda-41a5-96c2-9abfd1841f19", name: "Valeria Ruiz", passSize: 2, table: 6 },
    { id: "57a2b3df-0feb-43b6-a3d9-0d1ac2fb6020", name: "Fernando Morales", passSize: 3, table: 6 },
    { id: "68b3c4e0-1afc-4cc7-8fef-34bb1d6c4b21", name: "Elena Romero", passSize: 1, table: 7 },
    { id: "79c4d5f1-2bfd-4dd8-92a4-89cc3e7d5c22", name: "Ricardo Salazar", passSize: 2, table: 7 },
    { id: "8ad5e602-3c0e-4ee9-a4b8-ddef4f8e6d23", name: "Patricia Vega", passSize: 3, table: 7 },
    { id: "9be6f713-4d1f-4ffa-b71d-eef0519f7e24", name: "Alejandro Rivas", passSize: 4, table: 7 },
    { id: "acf70824-5e20-410b-8c26-fa1162b08125", name: "Gabriela Campos", passSize: 2, table: 8 }
  ];

  var firebaseConfig = window.FIREBASE_WEB_CONFIG || {};
  var firebaseReady = false;
  var firestore = null;

  function hasFirebaseConfig() {
    return Boolean(
      firebaseConfig &&
      firebaseConfig.apiKey &&
      firebaseConfig.apiKey !== "REEMPLAZA_API_KEY" &&
      firebaseConfig.projectId &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.messagingSenderId !== "REEMPLAZA_MESSAGING_SENDER_ID" &&
      firebaseConfig.appId &&
      firebaseConfig.appId !== "REEMPLAZA_APP_ID"
    );
  }

  function initFirebase() {
    if (!window.firebase || !hasFirebaseConfig()) return;

    if (!window.firebase.apps.length) {
      window.firebase.initializeApp(firebaseConfig);
    }

    firestore = window.firebase.firestore();
    firebaseReady = true;
  }

  initFirebase();

  function normalizeGuestTables(item) {
    if (!item) return [];

    if (Array.isArray(item.tables) && item.tables.length) {
      return item.tables.map(function (entry) {
        return {
          table: Number(entry && entry.table || 0),
          count: Number(entry && entry.count || 0),
          group: String(entry && entry.group || "").trim()
        };
      }).filter(function (entry) {
        return entry.table || entry.group || entry.count;
      });
    }

    if (item.table) {
      return [{
        table: Number(item.table || 0),
        count: Number(item.passSize || 0),
        group: ""
      }];
    }

    return [];
  }

  function normalizeGuest(item) {
    if (!item) return null;

    var normalizedTables = normalizeGuestTables(item);

    return {
      id: String(item.id || "").trim(),
      name: String(item.name || "").trim(),
      passSize: Number(item.passSize || 0),
      table: Number(item.table || 0),
      tables: normalizedTables,
      hasRsvp: Boolean(item.hasRsvp)
    };
  }

  function sanitizeRsvp(data) {
    if (!data || !data.attendance) return null;

    var rawAttendance = String(data.attendance || "").trim().toLowerCase();
    var normalizedAttendance = rawAttendance;

    if (
      rawAttendance === "decline" ||
      rawAttendance === "declined" ||
      rawAttendance === "no" ||
      rawAttendance === "0" ||
      rawAttendance === "no-asiste" ||
      rawAttendance === "no_asiste"
    ) {
      normalizedAttendance = "decline";
    }

    return {
      attendance: normalizedAttendance,
      message: String(data.message || "").trim(),
      updatedAt: data.updatedAt || null
    };
  }

  function getStoredRsvp(id) {
    var raw = localStorage.getItem("rsvp-" + id);
    if (!raw) return null;

    try {
      return sanitizeRsvp(JSON.parse(raw));
    } catch (error) {
      return null;
    }
  }

  function saveStoredRsvp(id, payload) {
    localStorage.setItem("rsvp-" + id, JSON.stringify(payload));
  }

  function loadGuestsFromJson() {
    return fetch("./invitados.json")
      .then(function (response) {
        if (!response.ok) throw new Error("No se pudo cargar el listado de invitados.");
        return response.json();
      })
      .then(function (guests) {
        return guests.map(normalizeGuest).filter(function (guest) {
          return guest && guest.id;
        });
      });
  }

  function loadGuestsFromFirestore() {
    return firestore.collection("invitados").orderBy("name").get().then(function (snapshot) {
      var guests = [];

      snapshot.forEach(function (doc) {
        var guest = normalizeGuest(Object.assign({ id: doc.id }, doc.data()));
        if (guest && guest.id) {
          guests.push(guest);
        }
      });

      if (!guests.length) {
        throw new Error("No hay invitados cargados en Firestore.");
      }

      return guests;
    });
  }

  function getAllStoredRsvps() {
    var records = {};

    for (var i = 0; i < localStorage.length; i += 1) {
      var key = localStorage.key(i);
      if (!key || key.indexOf("rsvp-") !== 0) continue;

      var id = key.replace(/^rsvp-/, "");
      var saved = getStoredRsvp(id);
      if (saved) {
        records[id] = saved;
      }
    }

    return Promise.resolve(records);
  }

  function getAllFirestoreRsvps() {
    return firestore.collection("confirmaciones").get().then(function (snapshot) {
      var records = {};

      snapshot.forEach(function (doc) {
        records[doc.id] = sanitizeRsvp(doc.data());
      });

      return records;
    });
  }

  function getFirestoreRsvp(id) {
    return firestore.collection("confirmaciones").doc(id).get().then(function (doc) {
      if (!doc.exists) return null;
      return sanitizeRsvp(doc.data());
    });
  }

  function saveFirestoreRsvp(id, guest, payload) {
    var timestamp = window.firebase.firestore.FieldValue.serverTimestamp();

    return Promise.all([
      firestore.collection("confirmaciones").doc(id).set({
        attendance: payload.attendance,
        message: payload.message,
        guestId: id,
        guestName: guest.name,
        passSize: guest.passSize,
        updatedAt: timestamp
      }, { merge: true }),
      firestore.collection("invitados").doc(id).set({
        hasRsvp: true,
        updatedAt: timestamp
      }, { merge: true })
    ]).then(function () {
      return {
        saved: sanitizeRsvp(payload),
        mode: "firestore"
      };
    });
  }

  function chunkList(items, size) {
    var chunks = [];

    for (var i = 0; i < items.length; i += size) {
      chunks.push(items.slice(i, i + size));
    }

    return chunks;
  }

  function runChunkedBatches(items, size, applyChunk) {
    var chunks = chunkList(items, size);
    var sequence = Promise.resolve();

    chunks.forEach(function (chunk) {
      sequence = sequence.then(function () {
        return applyChunk(chunk);
      });
    });

    return sequence;
  }

  function syncGuestRsvpFlags(guests, rsvpMap) {
    if (!firebaseReady) {
      return Promise.resolve(0);
    }

    var updates = guests.filter(function (guest) {
      return Boolean(guest.hasRsvp) !== Boolean(rsvpMap && rsvpMap[guest.id]);
    });

    return runChunkedBatches(updates, 400, function (group) {
      var batch = firestore.batch();

      group.forEach(function (guest) {
        var ref = firestore.collection("invitados").doc(guest.id);
        batch.set(ref, {
          hasRsvp: Boolean(rsvpMap && rsvpMap[guest.id])
        }, { merge: true });
      });

      return batch.commit();
    }).then(function () {
      return updates.length;
    });
  }

  window.AppData = {
    hasFirebaseConfig: hasFirebaseConfig,
    isUsingFirestore: function () {
      return firebaseReady;
    },
    loadGuests: function () {
      if (firebaseReady) {
        return loadGuestsFromFirestore().catch(function () {
          return loadGuestsFromJson().catch(function () {
            return fallbackGuests.slice();
          });
        });
      }

      return loadGuestsFromJson().catch(function () {
        return fallbackGuests.slice();
      });
    },
    getGuestById: function (id) {
      return this.loadGuests().then(function (guests) {
        return guests.find(function (guest) {
          return guest.id === id;
        }) || null;
      });
    },
    getRsvp: function (id) {
      if (firebaseReady) {
        return getFirestoreRsvp(id).catch(function () {
          return getStoredRsvp(id);
        });
      }

      return Promise.resolve(getStoredRsvp(id));
    },
    getAllRsvps: function () {
      if (firebaseReady) {
        return getAllFirestoreRsvps().catch(function () {
          return getAllStoredRsvps();
        });
      }

      return getAllStoredRsvps();
    },
    saveRsvp: function (guest, payload) {
      saveStoredRsvp(guest.id, payload);

      if (firebaseReady) {
        return saveFirestoreRsvp(guest.id, guest, payload).catch(function (error) {
          return {
            saved: payload,
            mode: "local-fallback",
            error: error
          };
        });
      }

      return Promise.resolve({
        saved: payload,
        mode: "local-only"
      });
    },
    importGuestsFromJson: function () {
      if (!firebaseReady) {
        return Promise.reject(new Error("Firebase no esta configurado todavia."));
      }

      return loadGuestsFromJson().then(function (guests) {
        var guestIds = guests.map(function (guest) {
          return guest.id;
        });

        return firestore.collection("invitados").get().then(function (snapshot) {
          var staleIds = [];

          snapshot.forEach(function (doc) {
            if (guestIds.indexOf(doc.id) === -1) {
              staleIds.push(doc.id);
            }
          });

          return runChunkedBatches(staleIds, 400, function (group) {
            var batch = firestore.batch();

            group.forEach(function (staleId) {
              var ref = firestore.collection("invitados").doc(staleId);
              batch.delete(ref);
            });

            return batch.commit();
          }).then(function () {
            return runChunkedBatches(guests, 400, function (group) {
              var batch = firestore.batch();

              group.forEach(function (guest) {
                var ref = firestore.collection("invitados").doc(guest.id);
                batch.set(ref, {
                  name: guest.name,
                  passSize: guest.passSize,
                  table: guest.table,
                  tables: guest.tables
                }, { merge: true });
              });

              return batch.commit();
            });
          }).then(function () {
            return {
              imported: guests.length,
              removed: staleIds.length
            };
          });
        });
      });
    },
    syncGuestRsvpFlags: function (guests, rsvpMap) {
      return syncGuestRsvpFlags(guests || [], rsvpMap || {});
    }
  };
})();
